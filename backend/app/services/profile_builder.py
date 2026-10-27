"""Role 3 - Profile Builder. Plain code: validate + JSON save/load."""
from __future__ import annotations
import json, re, uuid
from pathlib import Path

DIR = Path(__file__).resolve().parents[2] / "data" / "profiles"
CODES = {"COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD", "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER"}

def build_candidate_profile(d: dict) -> dict:
    email = (d.get("email") or "").strip()
    if not (d.get("name") or "").strip():
        raise ValueError("Name is required.")
    if email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise ValueError("Email looks invalid.")
    skills = []
    for s in d.get("skills") or []:
        s = {"skill_name": s} if isinstance(s, str) else dict(s)
        if not str(s.get("skill_name", "")).strip(): continue
        s["category_code"] = str(s.get("category_code") or "OTHER").upper()
        if s["category_code"] not in CODES: s["category_code"] = "OTHER"
        s.setdefault("evidence", ""); s.setdefault("confidence", "medium")
        skills.append(s)
    prof = {"candidate_id": d.get("candidate_id") or uuid.uuid4().hex[:12], "name": d["name"].strip(),
            "email": email, "education": d.get("education", ""), "skills": skills,
            "hackathons": d.get("hackathons") or [], "internships": d.get("internships") or [],
            "certifications": d.get("certifications") or [], "preferred_roles": d.get("preferred_roles") or [],
            "cv_file": d.get("cv_file", "")}
    DIR.mkdir(parents=True, exist_ok=True)
    (DIR / f"{prof['candidate_id']}.json").write_text(json.dumps(prof, indent=2), encoding="utf-8")
    return prof

def load_profile(cid: str) -> dict | None:
    p = DIR / f"{re.sub(r'[^a-zA-Z0-9_-]', '', cid)}.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None

def list_profiles() -> list[dict]:
    DIR.mkdir(parents=True, exist_ok=True)
    return [{"candidate_id": p["candidate_id"], "name": p["name"]} for p in
            (json.loads(f.read_text(encoding="utf-8")) for f in sorted(DIR.glob("*.json")))]

CV_DIR = DIR.parent / "cvs"

def save_cv(data: bytes, filename: str) -> str:
    """Store the uploaded CV and return the stored file name for the profile's cv_file field."""
    CV_DIR.mkdir(parents=True, exist_ok=True)
    safe = f"{uuid.uuid4().hex[:8]}_{re.sub(r'[^A-Za-z0-9._-]', '_', filename)[-80:]}"
    (CV_DIR / safe).write_bytes(data)
    return safe
