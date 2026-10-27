"""Seed the 6 sample JDs and 4 sample candidates (skill lists approximating the brief's descriptions).
These are STAND-INS so the demo works offline; re-run Role 1 / Role 2 on the real PDF/DOCX pack to replace them."""
import json, sys, uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'data' / 'profiles'
def get_storage_dir():
    (ROOT / 'data' / 'jd_results').mkdir(parents=True, exist_ok=True)
    return ROOT / 'data' / 'jd_results'

def S(spec, conf="high"):
    return [{"skill_name": n, "category_code": c, "evidence": "seed sample", "confidence": conf}
            for n, c in (x.split("|") for x in spec.split(";"))]
SWE = "Python|COD;Java|COD;C++|COD;Data Structures & Algorithms|DSA;Object-Oriented Design|OOD;System Design|SYSD;Distributed Systems|SYSD;Operating Systems|OS;Computer Networks|NETW;Git|SWE;Unit Testing|SWE;Problem Solving|APTI;Communication|COMM"
DATA = "Python|COD;SQL|SQL;Machine Learning|AI;Statistics|APTI;Pandas|COD;Data Visualization|SQL;Problem Solving|APTI;Communication|COMM;LLMs|AI"
JDS = {("Google LLC", "Software Engineer (SWE)"): SWE, ("Google LLC", "Data Scientist"): DATA,
       ("Microsoft Corporation", "Software Engineer"): SWE.replace("C++|COD", "C#|COD;Azure|CLOUD"),
       ("Microsoft Corporation", "Data Analyst"): "SQL|SQL;Excel|OTHER;Data Visualization|SQL;Python|COD;Statistics|APTI;Communication|COMM;Problem Solving|APTI",
       ("Oracle Financial Services Software", "Associate Software Engineer"): "Java|COD;SQL|SQL;Object-Oriented Design|OOD;Data Structures & Algorithms|DSA;Git|SWE;Communication|COMM;Problem Solving|APTI",
       ("Oracle Financial Services Software", "Application Support Analyst"): "SQL|SQL;Troubleshooting|OTHER;Communication|COMM;Operating Systems|OS;Excel|OTHER;Problem Solving|APTI"}
CANDS = {"sample-ananya": ("Ananya Rao", "Systems-leaning generalist", "Python|COD;Java|COD;C++|COD;Data Structures & Algorithms|DSA;Object-Oriented Design|OOD;System Design|SYSD;Operating Systems|OS;Computer Networks|NETW;Git|SWE;Unit Testing|SWE;Communication|COMM"),
         "sample-karthik": ("Karthik Subramanian", "Data-leaning analyst", "Python|COD;SQL|SQL;Machine Learning|AI;Statistics|APTI;Pandas|COD;Data Visualization|SQL;Problem Solving|APTI;Communication|COMM"),
         "sample-priya": ("Priya Menon", "Entry-level, support-oriented", "SQL|SQL;Excel|OTHER;Troubleshooting|OTHER;Communication|COMM;Problem Solving|APTI;Operating Systems|OS"),
         "sample-rohan": ("Rohan Verma", "Strong all-rounder", "Python|COD;Java|COD;C++|COD;Data Structures & Algorithms|DSA;Object-Oriented Design|OOD;System Design|SYSD;Distributed Systems|SYSD;Operating Systems|OS;Computer Networks|NETW;SQL|SQL;Machine Learning|AI;Statistics|APTI;Pandas|COD;Git|SWE;Unit Testing|SWE;Azure|CLOUD;Communication|COMM;Problem Solving|APTI;Data Visualization|SQL")}
if __name__ == "__main__":
    d = get_storage_dir()
    for f in d.glob("*.json"): f.unlink()
    for (co, role), spec in JDS.items():
        i = str(uuid.uuid5(uuid.NAMESPACE_URL, co + role))
        (d / f"{i}.json").write_text(json.dumps({"source_type": "jd", "source_file": f"SEED-{role}.pdf", "company": co,
            "role": role, "skills": S(spec), "id": i, "created_at": "2026-10-27T00:00:00+00:00"}, indent=2))
    DIR.mkdir(parents=True, exist_ok=True)
    for cid, (name, blurb, spec) in CANDS.items():
        (DIR / f"{cid}.json").write_text(json.dumps({"candidate_id": cid, "name": name, "email": "", "education": blurb,
            "skills": S(spec), "hackathons": [], "internships": [], "certifications": [], "preferred_roles": [], "cv_file": ""}, indent=2))
    print("seeded", len(JDS), "JDs and", len(CANDS), "candidates")
