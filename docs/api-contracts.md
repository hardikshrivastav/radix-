# Proposed API contracts

Only `GET /health` is implemented. The business endpoints below are proposed
contracts for discussion and are not functional endpoints in the current
scaffold. Exact payloads, authorization, persistence, and error responses
remain to be agreed before implementation.

| Method | Proposed endpoint | Responsibility |
| --- | --- | --- |
| `GET` | `/health` | Confirm that the API process responds. Implemented; returns `{"status":"ok"}`. |
| `POST` | `/api/jd-analytics` | Accept a job description and return extracted requirements using the approved competency framework. |
| `POST` | `/api/resume-parsing` | Accept resume content and return extracted candidate information. |
| `POST` | `/api/profiles` | Create or update a structured candidate profile. |
| `GET` | `/api/profiles/{candidate_id}` | Retrieve a candidate profile, subject to agreed access controls. |
| `POST` | `/api/talent-checks` | Assess a candidate against approved company expectations and the authoritative 12-skillset framework. |
| `POST` | `/api/skill-matches` | Compare a candidate profile with a job description and return an approved match result and skill gaps. |

No scoring formula, skillset labels, extraction behavior, or company hiring
data is defined by this proposal. The matching and assessment contracts depend
on decisions about the authoritative RADIX framework and must not be treated
as implemented functionality.

## Role 5 — Skill Matching (implemented)

`POST /api/skill-matches`

Request: `{ "jd_id": "<saved JD id>" | "jd": {JD skill list}, "profile": {...} | "resume": {...} | "candidate_skills": [...], "candidate_name": "...", "use_llm": true }`
(`skills` may be skill objects or plain strings.)

Response (contract fields first, extras additive):
`{ jd_source_file, match_score 0-100, matched_skills[], missing_skills[], verdict, summary, category_breakdown[], extra_candidate_skills[], used_llm }`

Scoring: JD skill weight = confidence (high 3 / medium 2 / low 1); earned = weight × match quality
(exact/synonym 1.0, fuzzy 0.85, AI-inferred 0.7); `match_score = earned / total × 100`.
Missing skills are sorted by priority (critical → important → nice_to_have).
Pipeline: exact → synonym/alias → fuzzy → optional LLM semantic pass (fails soft to deterministic result).

UI inputs: the JD comes from Role 1 (current result, or picked from saved analyses); the candidate comes from
Role 3 (profile) or Role 2 (resume). Typed skills (`candidate_skills`) are a fallback when neither exists yet.
Offline verification: `pytest tests/test_skill_matching.py tests/test_skill_matching_matrix.py` (no LLM or network needed).
