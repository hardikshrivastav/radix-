# Shared data contract (LOCKED v1)

Categories: COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL, SWE, SYSD, NETW, OS, OTHER (exactly one per skill).

**Skill** `{skill_name, category_code, evidence, confidence: high|medium|low}`

**Extracted skill list (Role 1 / Role 2)** `{source_type: jd|resume, source_file, company, role, skills[]}`
Role 2 adds `name, email, education, projects[], experience[], certifications[], extraction_method`.

**Candidate profile (Role 3)** `{candidate_id, name, email, education, skills[], hackathons[], internships[], certifications[], preferred_roles[], cv_file}`
Saved as `backend/data/profiles/<candidate_id>.json`; CV files in `backend/data/cvs/`.

**Talent Check result (Role 4)** `{company, skillset_gap[{category_code, required_level 1-10, candidate_level 1-10, gap}], readiness_score 0-100}`
Candidate level per category = 1 if no skills else min(10, 2 + 2.5 x weighted skill count) (high=1, medium=.7, low=.4).
Readiness = sum(min(candidate/required,1) x required) / sum(required) x 100.

**Skill Matching result (Role 5)** `{jd_source_file, match_score 0-100, matched_skills[], missing_skills[]}` (plus per-category breakdown).

Endpoints: POST /api/jd-analytics, POST /api/resume-parsing, POST/GET /api/profiles, POST /api/profiles/cv,
GET /api/talent-check/companies, POST /api/talent-checks, POST /api/skill-matches.
