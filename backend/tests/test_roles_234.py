from app.services import talent_check, resume_parser, profile_builder
TXT = b"Priya Menon\npriya@x.com\nSkills: SQL, Oracle DB, Excel, troubleshooting tickets, communication\nEducation\nB.Tech CSE\n"
ROHAN = [{"skill_name": n, "category_code": c, "confidence": "high"} for n, c in
         [("Python","COD"),("Java","COD"),("DSA","DSA"),("OOD","OOD"),("SQL","SQL"),("ML","AI"),("Git","SWE"),
          ("System Design","SYSD"),("OS","OS"),("Net","NETW"),("Comm","COMM"),("PS","APTI"),("AWS","CLOUD")]]
def test_resume():
    r = resume_parser.parse_resume(TXT, "r.txt")
    assert r["email"] == "priya@x.com" and any(s["skill_name"] == "SQL" for s in r["skills"])
def test_profile_roundtrip():
    p = profile_builder.build_candidate_profile({"name": "T", "skills": r_skills()})
    assert profile_builder.load_profile(p["candidate_id"])["name"] == "T"
def r_skills(): return resume_parser.parse_resume(TXT, "r.txt")["skills"]
def test_scores_differ():
    a = talent_check.assess(ROHAN, "Google")["readiness_score"]
    b = talent_check.assess(r_skills(), "Google")["readiness_score"]
    c = talent_check.assess(r_skills(), "Oracle")["readiness_score"]
    assert a > b and c > b
def test_levels_in_contract_range():
    g = talent_check.assess([], "Oracle Financial")["skillset_gap"]
    assert all(1 <= x["candidate_level"] <= 10 for x in g)
