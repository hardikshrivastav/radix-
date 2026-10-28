# SkillSync — AI-Powered Career-Readiness Platform

SkillSync is an AI-powered career-readiness platform that helps candidates build complete profiles, analyze job descriptions, assess their skills, and identify their alignment with specific job opportunities.

## Five Connected Modules

1. **JD Analytics** — Extract, normalize, and edit requirements mapped to the official 12-skillset framework plus OTHER.
2. **Resume Parsing** — Extract skills, experience, education, projects, and certifications from resumes (.pdf, .docx, .txt).
3. **Profile Builder** — Build, enrich, review, and persist a structured candidate profile with 12-category skill tagging.
4. **Talent Check** — Benchmark candidate competency against Tier 1 and enterprise hiring bars using explainable scoring.
5. **Skill Matching** — Compare a candidate profile with a specific job posting and report an explainable match score and priority skill gaps.

The end-to-end connected workflow is:

`Job Description (JD Analytics) → Resume Parsing → Candidate Profile (Profile Builder) → Talent Check → Skill Matching`

## Technology Stack

- **Backend:** Python, FastAPI, LangChain and LLM-agent interfaces, Supabase PostgreSQL
- **Frontend:** React, JavaScript, CSS, and Vite

## Repository Layout

- `frontend/src/` — React application, landing page, 5 modules, components, design system, and workflow state
- `backend/app/services/` — backend services for JD Analytics, Resume Parsing, Profile Builder, Talent Check, and Skill Matching
- `backend/app/models/` and `backend/app/schemas/` — shared domain models and API contracts
- `backend/app/core/` — centralized application configuration and exceptions
- `backend/app/database/` — Supabase client integration point
- `docs/` — architecture, API contracts, and milestone specifications

## Local Setup

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend development server starts on `http://localhost:5173`.

### Backend (PowerShell)

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

The API health check is available at `http://127.0.0.1:8000/health`.

## Current Status

All five modules are fully connected and functional:

| Module | Description | Implementation |
| --- | --- | --- |
| Landing Page | High-fidelity dark cosmic design with 3D preview | React + CSS design system |
| JD Analytics | Job requirement extraction & editable results | Plain text + File upload + Gemini / local extraction |
| Resume Parsing | PDF/DOCX/TXT resume parsing & review | Candidate schema conversion + Transfer to Profile Builder |
| Profile Builder | Comprehensive candidate career profile | Full profile form + 12-category skill mapping + JSON export |
| Talent Check | Employer competency benchmark assessment | 12-skillset formula (levels 1-10, readiness 0-100%) |
| Skill Matching | Role-specific weighted skill alignment & gap list | Exact, synonym, fuzzy matching with explainable priority gaps |
