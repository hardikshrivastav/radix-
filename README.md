# RADIX Talent Match

RADIX Talent Match is a candidate-focused job-readiness and skill-matching platform. It is intended to reuse RADIX's existing 12-skillset competency framework and hiring-related data so candidates can understand their readiness for a specific role.

## Planned modules

1. **JD Analytics** — Extract skills, competencies, and technical requirements from a job description.
2. **Resume Parsing** — Extract skills, experience, education, and other relevant information from a candidate's resume.
3. **Profile Builder** — Build or update a structured candidate profile using resume information and additional candidate inputs.
4. **Talent Check** — Assess candidate readiness against a company's expectations across the 12 skillsets.
5. **Skill Matching** — Compare a candidate profile with a job description and report a match score and skill gaps.

The intended workflow is:

`Job Description → Resume Parsing → Candidate Profile → Talent Check → Skill Matching`

## Technology stack

- **Backend:** Python, FastAPI, LangChain and LLM-agent interfaces, Supabase PostgreSQL
- **Frontend:** React, JavaScript, CSS, and Vite

The authoritative names, definitions, weights, and scoring rules for the 12 skillsets have not yet been supplied and are intentionally not invented here. Credentials belong in local environment files and must never be committed.

## Repository layout

- `backend/app/services/` — independent starter interfaces for the five modules
- `backend/app/models/` and `backend/app/schemas/` — shared domain models and API contracts
- `backend/app/core/` — centralized application configuration and exceptions
- `backend/app/agents/` — future LangChain LLM and workflow integration points
- `backend/app/database/` — lazy Supabase integration point
- `frontend/src/` — React application, pages, components, styles, and API helper
- `docs/` — architecture, proposed API contracts, and team ownership

## Prerequisites

- Python 3.12
- Node.js and npm (a supported Node.js LTS release)

## Local setup

### Backend (PowerShell)

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

The API health check is available at `http://127.0.0.1:8000/health`. The environment file may remain unconfigured until a feature needs an external service.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite prints the local development URL when the server starts. The frontend API helper defaults to `http://127.0.0.1:8000`.

## Current status

All five modules are implemented:

| Role | Module | Approach |
| --- | --- | --- |
| 1 | JD Analytics | LangChain + Gemini extraction (needs `LLM_API_KEY`) |
| 2 | Resume Parsing | Offline keyword/lexicon extraction for PDF/DOCX/TXT, section detection |
| 3 | Profile Builder | Form + validation + JSON save/load (`backend/data/profiles`) |
| 4 | Talent Check | Local CSV snapshot; level = f(skills per category); readiness = required-weighted coverage |
| 5 | Skill Matching | exact -> alias -> fuzzy -> optional LLM; weighted score + gap list |

Flow: JD -> Resume -> Profile -> Talent Check -> Skill Matching. Run backend tests with `python -m pytest backend/tests`.
Known limits: Resume Parsing is keyword-based (no LLM); the frontend build was not run in the packaging environment, so run `npm install && npm run dev` once before demo day.
