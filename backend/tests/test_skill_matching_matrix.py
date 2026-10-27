"""Candidate x JD matrix for Role 5 (service-level, no LLM, no network).

The brief's "done" criterion: results must visibly differ from person to
person. The skill lists below mirror the shape of the four sample candidates
(systems generalist, data analyst, entry-level support, strong all-rounder)
against two JD archetypes (SWE-heavy, data-heavy).
"""

from app.services.skill_matching import match_skills


def S(name, cat="COD", conf="high"):
    return {"skill_name": name, "category_code": cat, "evidence": "", "confidence": conf}


SWE_JD = [
    S("Python"), S("Java"), S("C++"), S("Data Structures & Algorithms", "DSA"),
    S("System Design", "SYSD"), S("Distributed Systems", "SYSD"),
    S("Operating Systems", "OS"), S("Computer Networks", "NETW"),
    S("Git", "SWE", "medium"), S("Unit Testing", "SWE", "medium"),
    S("Communication", "COMM", "low"),
]
DATA_JD = [
    S("Python"), S("SQL", "SQL"), S("Machine Learning", "AI"), S("Statistics", "APTI"),
    S("Pandas", "COD"), S("Data Visualization", "OTHER", "medium"),
    S("Problem Solving", "APTI", "medium"), S("Communication", "COMM", "low"),
]

CANDIDATES = {
    "ananya": ["Python", "Java", "C++", "DSA", "Systems Design", "OS", "TCP/IP", "Git", "Linux"],
    "karthik": ["Python", "SQL", "ML", "Statistics", "Pandas", "Data Visualization", "Tableau"],
    "priya": ["SQL", "Oracle", "Troubleshooting", "Communication", "Excel"],
    "rohan": ["Python", "Java", "DSA", "System Design", "Distributed Systems", "SQL", "ML",
              "Statistics", "Pandas", "Git", "Unit Testing", "Communication", "Computer Networks",
              "Operating Systems", "C++", "Problem Solving"],
}


def score(jd, who):
    return match_skills(jd, CANDIDATES[who], use_llm=False).match_score


def test_swe_jd_ranking():
    assert score(SWE_JD, "ananya") > score(SWE_JD, "karthik")
    assert score(SWE_JD, "ananya") > score(SWE_JD, "priya")
    assert score(SWE_JD, "rohan") >= score(SWE_JD, "ananya")


def test_data_jd_ranking():
    assert score(DATA_JD, "karthik") > score(DATA_JD, "ananya")
    assert score(DATA_JD, "karthik") > score(DATA_JD, "priya")


def test_same_candidate_differs_across_jds():
    assert abs(score(SWE_JD, "ananya") - score(DATA_JD, "ananya")) >= 15
    assert abs(score(SWE_JD, "karthik") - score(DATA_JD, "karthik")) >= 15


def test_scores_are_not_constant():
    scores = {score(SWE_JD, w) for w in CANDIDATES} | {score(DATA_JD, w) for w in CANDIDATES}
    assert len(scores) >= 5


def test_gap_list_is_explained_and_ordered():
    r = match_skills(SWE_JD, CANDIDATES["priya"], use_llm=False)
    assert r.missing_skills, "weak candidate must have gaps"
    weights = [m.weight for m in r.missing_skills]
    assert weights == sorted(weights, reverse=True)
    assert all(m.evidence for m in r.missing_skills)
    assert r.summary and r.verdict


def test_matched_and_missing_partition_jd():
    r = match_skills(DATA_JD, CANDIDATES["karthik"], use_llm=False)
    got = {m.skill_name for m in r.matched_skills} | {m.skill_name for m in r.missing_skills}
    assert got == {j["skill_name"] for j in DATA_JD}
