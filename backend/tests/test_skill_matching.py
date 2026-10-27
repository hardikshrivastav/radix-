"""Offline tests for Skill Matching (Role 5). LLM pass disabled/mocked."""

from fastapi.testclient import TestClient

from main import app
from app.services.skill_matching import match_skills

client = TestClient(app)


def S(name, cat="COD", conf="high"):
    return {"skill_name": name, "category_code": cat, "evidence": "", "confidence": conf}


JD = [S("Python"), S("PostgreSQL", "SQL"), S("Kubernetes", "CLOUD"),
      S("Data Structures & Algorithms", "DSA"), S("Communication", "COMM", "low")]


def test_exact_alias_and_gaps():
    cand = ["python", "Postgres", "DSA"]
    r = match_skills(JD, cand, use_llm=False)
    names = {m.skill_name: m.match_type for m in r.matched_skills}
    assert names["Python"] in ("exact", "alias")
    assert names["PostgreSQL"] == "alias"
    assert names["Data Structures & Algorithms"] == "alias"
    assert {m.skill_name for m in r.missing_skills} == {"Kubernetes", "Communication"}
    assert r.missing_skills[0].priority == "critical"
    assert 0 < r.match_score < 100


def test_fuzzy_match():
    r = match_skills([S("Spring Boot")], ["Spring Boot Framework"], use_llm=False)
    assert r.matched_skills and r.matched_skills[0].match_type == "fuzzy"


def test_no_false_positive():
    r = match_skills([S("MongoDB", "SQL")], ["MySQL"], use_llm=False)
    assert not r.matched_skills


def test_scores_differ_by_candidate():
    strong = match_skills(JD, ["Python", "PostgreSQL", "Kubernetes", "DSA", "Communication"], use_llm=False)
    weak = match_skills(JD, ["Excel"], use_llm=False)
    assert strong.match_score == 100 and weak.match_score == 0


def test_weighting_high_beats_low():
    a = match_skills([S("A1"), S("B1", conf="low")], ["A1"], use_llm=False)
    b = match_skills([S("A1"), S("B1", conf="low")], ["B1"], use_llm=False)
    assert a.match_score > b.match_score


def test_empty_jd_is_zero():
    assert match_skills([], ["Python"], use_llm=False).match_score == 0


def test_endpoint_inline():
    res = client.post("/api/skill-matches", json={
        "jd": {"source_file": "x.pdf", "company": "Google", "role": "SWE", "skills": JD},
        "profile": {"name": "Anny", "skills": ["Python", "DSA"]},
        "use_llm": False,
    })
    assert res.status_code == 200
    body = res.json()
    assert body["jd_source_file"] == "x.pdf"
    assert body["candidate_name"] == "Anny"
    assert "matched_skills" in body and "missing_skills" in body


def test_endpoint_validation():
    assert client.post("/api/skill-matches", json={"use_llm": False}).status_code == 400
    r = client.post("/api/skill-matches", json={"jd": {"skills": JD}, "use_llm": False})
    assert r.status_code == 400
    assert client.post("/api/skill-matches", json={"jd_id": "nope", "profile": {"skills": ["a"]}}).status_code == 404


def test_endpoint_manual_skills_and_resume_name():
    res = client.post("/api/skill-matches", json={
        "jd": {"source_file": "x.pdf", "skills": JD},
        "candidate_skills": ["Python", "Postgres"],
        "candidate_name": "Typed",
        "use_llm": False,
    })
    assert res.status_code == 200
    assert res.json()["candidate_name"] == "Typed"
    assert res.json()["candidate_source"] == "manual"

    res = client.post("/api/skill-matches", json={
        "jd": {"source_file": "x.pdf", "skills": JD},
        "resume": {"candidate_name": "Jane", "skills": [S("Python")]},
        "use_llm": False,
    })
    assert res.json()["candidate_name"] == "Jane"
    assert res.json()["candidate_source"] == "resume"
