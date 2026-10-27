# Live demo script (rehearse end to end)
1. **Problem (1 min):** candidates cannot tell how ready they are for a *specific* job. We flip RADIX's company-side data to the candidate.
2. **Architecture (1 min):** React -> FastAPI -> 5 services; shared JSON contract (docs/data-contract.md); LLM only where it helps (Roles 1, 2, 5), plain code for Roles 3-4.
3. **Live demo:** Pick JD (Google SWE) -> parse a resume (note extraction_method) -> Profile (load sample, upload CV, save) -> Talent Check vs Google -> Skill Matching.
   Then repeat with Priya vs Oracle Application Support (score ~100) and Karthik vs Google Data Scientist: results differ per person.
4. **One challenge:** resumes are messy/unstandardised -> LLM extraction merged with keyword fallback so the tool never fails without an API key; scoring weights by confidence.
Backup: screen recording + `pytest backend/tests`. Q&A: why FUZZY_THRESHOLD 0.86, why semantic weight 0.7, why gap list over score.
