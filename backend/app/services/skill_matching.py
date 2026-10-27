"""Skill Matching service (Role 5).

Compares a candidate's skills (saved profile or parsed resume) against ONE
extracted JD skill list (Role 1) and returns a match score plus matched /
missing skills, with the gap list as the primary output.

Matching pipeline (cheap and deterministic first, LLM only for leftovers):
  1. exact match on normalised name
  2. alias / synonym match (Postgres == PostgreSQL, k8s == Kubernetes ...)
  3. fuzzy string match (token overlap + difflib ratio)
  4. optional LLM semantic pass for still-unmatched JD skills
     (e.g. "Spring Boot" is covered by "Java microservices"). Fails soft:
     if no API key / any error, the deterministic result is returned.

Scoring: each JD skill carries a weight from its confidence
(high=3, medium=2, low=1). A matched skill earns weight * match quality
(exact 1.0, alias 1.0, fuzzy 0.85, semantic 0.7). match_score = earned / total * 100.
"""

from __future__ import annotations

import json
import logging
import re
from difflib import SequenceMatcher
from typing import Any

from app.schemas.matching_schema import (
    CategoryBreakdown,
    MatchedSkill,
    MissingSkill,
    SkillMatchResult,
)

logger = logging.getLogger(__name__)

CONFIDENCE_WEIGHT = {"high": 3, "medium": 2, "low": 1}
MATCH_QUALITY = {"exact": 1.0, "alias": 1.0, "fuzzy": 0.85, "semantic": 0.7}
FUZZY_THRESHOLD = 0.86

# Synonym groups on top of jd_analytics.SKILL_ALIASES.
SYNONYM_GROUPS: list[set[str]] = [
    {"object-oriented programming (oop)", "oop", "oops", "object oriented programming",
     "object-oriented design", "object oriented design", "ood"},
    {"data structures and algorithms", "dsa", "data structures", "algorithms"},
    {"machine learning", "ml"},
    {"natural language processing (nlp)", "nlp", "natural language processing"},
    {"llms", "llm", "large language models", "generative ai", "genai"},
    {"ci/cd", "cicd", "continuous integration", "continuous delivery"},
    {"rest apis", "rest", "restful apis", "restful", "rest api", "restful services"},
    {"aws", "amazon web services"},
    {"google cloud platform", "gcp", "google cloud"},
    {"microsoft azure", "azure"},
    {"kubernetes", "k8s"},
    {"postgresql", "postgres", "psql"},
    {"mongodb", "mongo"},
    {"javascript", "js", "ecmascript"},
    {"typescript", "ts"},
    {"c++", "cpp"},
    {"c#", "csharp", "c sharp"},
    {".net", "dotnet", ".net core", "asp.net"},
    {"agile / scrum", "agile", "scrum", "agile methodologies"},
    {"sql", "relational databases", "rdbms", "structured query language"},
    {"operating systems", "os", "linux/unix", "unix"},
    {"computer networks", "networking", "tcp/ip", "computer networking"},
    {"system design", "systems design", "low level design", "high level design",
     "software architecture"},
    {"problem solving", "analytical thinking", "aptitude", "logical reasoning",
     "quantitative aptitude"},
    {"communication", "communication skills", "verbal communication",
     "written communication"},
    {"unit testing", "testing", "test-driven development", "tdd"},
]

_STOPWORDS = {"and", "or", "the", "of", "in", "for", "with", "to", "a", "an", "skills", "knowledge"}


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _basic_norm(name: str) -> str:
    s = (name or "").strip().lower()
    s = s.replace("&", " and ")
    return re.sub(r"\s+", " ", s)


def _canonical(name: str) -> str:
    """Normalise via Role 1's alias table when available, then lowercase."""
    try:
        from app.services.jd_analytics import normalize_skill_name

        return _basic_norm(normalize_skill_name(name))
    except Exception:  # pragma: no cover - defensive
        return _basic_norm(name)


_GROUP_INDEX: dict[str, str] = {}
for _i, _g in enumerate(SYNONYM_GROUPS):
    for _n in _g:
        _GROUP_INDEX[_basic_norm(_n)] = f"grp{_i}"


def _synonym_key(name: str) -> str | None:
    return _GROUP_INDEX.get(_basic_norm(name)) or _GROUP_INDEX.get(_canonical(name))


def _tokens(name: str) -> set[str]:
    toks = set(re.findall(r"[a-z0-9\+#\.]+", _basic_norm(name)))
    return {t for t in toks if t not in _STOPWORDS}


def _fuzzy_score(a: str, b: str) -> float:
    na, nb = _basic_norm(a), _basic_norm(b)
    if not na or not nb:
        return 0.0
    ratio = SequenceMatcher(None, na, nb).ratio()
    ta, tb = _tokens(a), _tokens(b)
    if ta and tb:
        jaccard = len(ta & tb) / len(ta | tb)
        # Token subset ("spring boot" vs "spring") counts strongly when the
        # shared part is meaningful.
        if (ta <= tb or tb <= ta) and len(" ".join(ta & tb)) >= 5:
            jaccard = max(jaccard, 0.88)
        return max(ratio, jaccard)
    return ratio


# ---------------------------------------------------------------------------
# Input coercion
# ---------------------------------------------------------------------------

def coerce_skills(raw: Any) -> list[dict[str, Any]]:
    """Accept a list of strings / skill dicts / objects -> deduped skill dicts."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in raw or []:
        if isinstance(item, str):
            d: dict[str, Any] = {"skill_name": item}
        elif isinstance(item, dict):
            d = dict(item)
        else:
            d = {
                "skill_name": getattr(item, "skill_name", ""),
                "category_code": getattr(item, "category_code", "OTHER"),
                "evidence": getattr(item, "evidence", ""),
                "confidence": getattr(item, "confidence", "medium"),
            }
        name = str(d.get("skill_name") or d.get("name") or "").strip()
        if not name:
            continue
        key = _canonical(name)
        if key in seen:
            continue
        seen.add(key)
        d["skill_name"] = name
        d["category_code"] = str(d.get("category_code") or "OTHER").upper()
        d["evidence"] = str(d.get("evidence") or "")
        conf = str(d.get("confidence") or "medium").lower()
        d["confidence"] = conf if conf in CONFIDENCE_WEIGHT else "medium"
        out.append(d)
    return out


# ---------------------------------------------------------------------------
# Deterministic matching
# ---------------------------------------------------------------------------

def _deterministic_match(
    jd_skill: dict[str, Any], cand_skills: list[dict[str, Any]]
) -> tuple[dict[str, Any], str, float] | None:
    jd_name = jd_skill["skill_name"]
    jd_basic, jd_canon = _basic_norm(jd_name), _canonical(jd_name)
    jd_syn = _synonym_key(jd_name)

    for c in cand_skills:
        if _basic_norm(c["skill_name"]) == jd_basic:
            return c, "exact", 1.0
    for c in cand_skills:
        if _canonical(c["skill_name"]) == jd_canon:
            return c, "alias", 1.0
        if jd_syn and _synonym_key(c["skill_name"]) == jd_syn:
            return c, "alias", 1.0
    best: tuple[dict[str, Any], float] | None = None
    for c in cand_skills:
        score = _fuzzy_score(jd_name, c["skill_name"])
        if score >= FUZZY_THRESHOLD and (best is None or score > best[1]):
            best = (c, score)
    if best:
        return best[0], "fuzzy", round(best[1], 2)
    return None


# ---------------------------------------------------------------------------
# Optional LLM semantic pass
# ---------------------------------------------------------------------------

def _llm_semantic_pass(
    unmatched: list[dict[str, Any]], cand_skills: list[dict[str, Any]]
) -> dict[str, tuple[str, str]]:
    """Ask the LLM which unmatched JD skills the candidate already covers.

    Returns {jd_skill_name: (candidate_skill_name, reason)}. Fails soft ({}).
    """
    if not unmatched or not cand_skills:
        return {}
    try:
        from app.agents.llm_factory import create_llm

        llm = create_llm()
        cand_names = [c["skill_name"] for c in cand_skills]
        jd_names = [u["skill_name"] for u in unmatched]
        prompt = (
            "You compare a candidate's skills with job requirements. For each REQUIRED "
            "skill, decide if the candidate's skill list clearly demonstrates it "
            "(same skill described differently, or a specific tool clearly implying it). "
            "Be strict: related-but-different skills (e.g. MySQL vs MongoDB) do NOT match.\n\n"
            f"REQUIRED: {json.dumps(jd_names)}\n"
            f"CANDIDATE: {json.dumps(cand_names)}\n\n"
            'Reply with ONLY JSON: {"matches":[{"required":"<exact required name>",'
            '"candidate":"<exact candidate name>","reason":"<short reason>"}]}. '
            "Omit required skills with no match."
        )
        response = llm.invoke(prompt)
        content = getattr(response, "content", "")
        if isinstance(content, list):
            content = " ".join(
                str(c.get("text", "")) if isinstance(c, dict) else str(c) for c in content
            )
        m = re.search(r"\{.*\}", content, re.DOTALL)
        if not m:
            return {}
        data = json.loads(m.group(0))
        valid_jd, valid_cand = set(jd_names), set(cand_names)
        out: dict[str, tuple[str, str]] = {}
        for row in data.get("matches", []):
            req, cand = row.get("required"), row.get("candidate")
            if req in valid_jd and cand in valid_cand:
                out[req] = (cand, str(row.get("reason") or "Semantically equivalent"))
        return out
    except Exception as exc:
        logger.info("LLM semantic matching skipped: %s", exc)
        return {}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def match_skills(
    jd_skills_raw: Any,
    candidate_skills_raw: Any,
    *,
    jd_source_file: str = "",
    jd_id: str | None = None,
    company: str | None = None,
    role: str | None = None,
    candidate_name: str | None = None,
    candidate_source: str = "profile",
    use_llm: bool = True,
) -> SkillMatchResult:
    """Compute the match between one JD skill list and a candidate skill list."""
    jd_skills = coerce_skills(jd_skills_raw)
    cand_skills = coerce_skills(candidate_skills_raw)

    matched: list[MatchedSkill] = []
    missing_pool: list[dict[str, Any]] = []

    for jd in jd_skills:
        hit = _deterministic_match(jd, cand_skills)
        if hit:
            cand, method, sim = hit
            matched.append(_mk_matched(jd, cand, method, sim))
        else:
            missing_pool.append(jd)

    llm_used = False
    if use_llm and missing_pool and cand_skills:
        sem = _llm_semantic_pass(missing_pool, cand_skills)
        if sem:
            llm_used = True
            still_missing = []
            for jd in missing_pool:
                if jd["skill_name"] in sem:
                    cand_name, reason = sem[jd["skill_name"]]
                    cand = next(c for c in cand_skills if c["skill_name"] == cand_name)
                    ms = _mk_matched(jd, cand, "semantic", 0.7)
                    ms.evidence = f"{reason} (candidate: {cand_name})"
                    matched.append(ms)
                else:
                    still_missing.append(jd)
            missing_pool = still_missing

    missing = [_mk_missing(jd) for jd in missing_pool]
    missing.sort(key=lambda m: (-m.weight, m.skill_name.lower()))
    matched.sort(key=lambda m: (-m.weight, m.skill_name.lower()))

    total_weight = sum(CONFIDENCE_WEIGHT[j["confidence"]] for j in jd_skills)
    earned = sum(m.weight * MATCH_QUALITY[m.match_type] for m in matched)
    score = round(earned / total_weight * 100) if total_weight else 0

    return SkillMatchResult(
        jd_id=jd_id,
        jd_source_file=jd_source_file,
        company=company,
        role=role,
        candidate_name=candidate_name,
        candidate_source=candidate_source,
        match_score=score,
        verdict=_verdict(score),
        matched_skills=matched,
        missing_skills=missing,
        category_breakdown=_category_breakdown(jd_skills, matched),
        extra_candidate_skills=_extra_skills(cand_skills, matched),
        total_jd_skills=len(jd_skills),
        total_candidate_skills=len(cand_skills),
        used_llm=llm_used,
        summary=_summary(score, matched, missing),
    )


def _mk_matched(jd: dict[str, Any], cand: dict[str, Any], method: str, sim: float) -> MatchedSkill:
    same = _basic_norm(jd["skill_name"]) == _basic_norm(cand["skill_name"])
    ev = "Required in JD and present in candidate skills" if same else (
        f"Covered by candidate skill '{cand['skill_name']}'"
    )
    return MatchedSkill(
        skill_name=jd["skill_name"],
        category_code=jd["category_code"],
        evidence=ev,
        confidence=jd["confidence"],
        candidate_skill=cand["skill_name"],
        match_type=method,
        similarity=sim,
        weight=CONFIDENCE_WEIGHT[jd["confidence"]],
    )


def _mk_missing(jd: dict[str, Any]) -> MissingSkill:
    conf = jd["confidence"]
    priority = {"high": "critical", "medium": "important", "low": "nice_to_have"}[conf]
    return MissingSkill(
        skill_name=jd["skill_name"],
        category_code=jd["category_code"],
        evidence=jd.get("evidence") or "Required in JD, missing from candidate",
        confidence=conf,
        priority=priority,
        weight=CONFIDENCE_WEIGHT[conf],
    )


def _category_breakdown(jd_skills: list[dict[str, Any]], matched: list[MatchedSkill]) -> list[CategoryBreakdown]:
    by_name = {m.skill_name: m for m in matched}
    cats: dict[str, dict[str, float]] = {}
    for j in jd_skills:
        c = cats.setdefault(j["category_code"], {"total": 0, "matched": 0, "w_total": 0.0, "w_earned": 0.0})
        w = CONFIDENCE_WEIGHT[j["confidence"]]
        c["total"] += 1
        c["w_total"] += w
        m = by_name.get(j["skill_name"])
        if m:
            c["matched"] += 1
            c["w_earned"] += w * MATCH_QUALITY[m.match_type]
    rows = [
        CategoryBreakdown(
            category_code=code,
            required=int(v["total"]),
            matched=int(v["matched"]),
            score=round(v["w_earned"] / v["w_total"] * 100) if v["w_total"] else 0,
        )
        for code, v in cats.items()
    ]
    rows.sort(key=lambda r: (r.score, r.category_code))
    return rows


def _extra_skills(cand_skills: list[dict[str, Any]], matched: list[MatchedSkill]) -> list[str]:
    used = {_canonical(m.candidate_skill) for m in matched}
    return sorted(c["skill_name"] for c in cand_skills if _canonical(c["skill_name"]) not in used)[:30]


def _verdict(score: int) -> str:
    if score >= 80:
        return "Strong match"
    if score >= 60:
        return "Good match"
    if score >= 40:
        return "Partial match"
    return "Weak match"


def _summary(score: int, matched: list[MatchedSkill], missing: list[MissingSkill]) -> str:
    crit = [m.skill_name for m in missing if m.priority == "critical"][:3]
    base = f"Matches {len(matched)} of {len(matched) + len(missing)} required skills ({score}%)."
    if crit:
        base += " Top gaps to close: " + ", ".join(crit) + "."
    elif not missing:
        base += " No gaps found."
    return base
