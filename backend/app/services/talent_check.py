"""Role 4 - Talent Check. Plain scoring code against the local company snapshot.

Design decision ("ready" defined numerically):
  candidate_level(cat) = 1 if no skills else min(10, 2 + 2.5 * weighted_skill_count), weights high=1, medium=.7, low=.4
  per-category credit  = min(candidate/required, 1); gap = candidate < required
  readiness_score      = required-level-weighted mean credit * 100 (tougher categories count more).
"""
from __future__ import annotations
import csv
from functools import lru_cache
from pathlib import Path

CSV = Path(__file__).resolve().parents[2] / "data" / "staging_company_skill_levels" / "staging_company_skill_levels_rows.csv"
COLS = {"coding": "COD", "data_structures_and_algorithms": "DSA", "object_oriented_programming_and_design": "OOD",
        "aptitude_and_problem_solving": "APTI", "communication_skills": "COMM", "ai_native_engineering": "AI",
        "devops_and_cloud": "CLOUD", "sql_and_design": "SQL", "software_engineering": "SWE",
        "system_design_and_architecture": "SYSD", "computer_networking": "NETW", "operating_system": "OS"}
W = {"high": 1.0, "medium": 0.7, "low": 0.4}

@lru_cache(maxsize=1)
def load_companies() -> dict[str, dict[str, int]]:
    out = {}
    with open(CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            lv = {}
            for col, code in COLS.items():
                try: lv[code] = int(str(r[col]).split("-")[0].strip())
                except (ValueError, KeyError): lv[code] = 0
            out[r["companies"]] = lv
    return out

def find_company(q: str) -> str | None:
    q = q.lower().strip()
    names = load_companies()
    return next((n for n in names if n.lower() == q), None) or next((n for n in names if q and q in n.lower()), None)

def candidate_levels(skills: list[dict]) -> dict[str, float]:
    score = {c: 0.0 for c in COLS.values()}
    for s in skills:
        c = str(s.get("category_code", "OTHER")).upper()
        if c in score: score[c] += W.get(str(s.get("confidence", "medium")).lower(), 0.7)
    return {c: round(min(10.0, 2 + 2.5 * v) if v else 1.0, 1) for c, v in score.items()}

def assess(skills: list[dict], company: str) -> dict:
    name = find_company(company)
    if not name: raise KeyError(f"Company '{company}' not found in snapshot.")
    req, cand = load_companies()[name], candidate_levels(skills)
    gaps = [{"category_code": c, "required_level": req[c], "candidate_level": cand[c],
             "gap": cand[c] < req[c]} for c in COLS.values()]
    tw = sum(req.values()) or 1
    score = sum(min(cand[c] / req[c], 1) * req[c] for c in req if req[c]) / tw * 100
    return {"company": name, "skillset_gap": gaps, "readiness_score": round(score)}
