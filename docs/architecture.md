# Architecture

## Current scaffold and planned components

The repository currently contains a React/Vite frontend and a Python/FastAPI
backend starter. The health-check route is implemented. The module services,
LLM workflows, and Supabase data operations are **planned**, not implemented.

The intended architecture is:

- **React frontend (implemented as a UI scaffold):** presents the dashboard and
  five module placeholders. Its centralized API helper targets the local API
  by default.
- **Python API (partially implemented):** FastAPI exposes `/health`. Future
  module endpoints will validate requests and coordinate with module services.
- **LangChain / LLM layer (planned):** provider selection, model setup, and
  workflow orchestration will be added only after requirements and contracts
  are agreed. No model is initialized and no LLM calls are made.
- **Supabase PostgreSQL data layer (planned):** the lazy client boundary exists;
  schema design, connection use, and persistence are not implemented. No tables
  or migrations are created.

## Intended request flow

1. A candidate or team member selects a module in the React application.
2. The frontend sends a request to the corresponding Python API contract.
3. The API validates it against shared request schemas and invokes that
   module's independent service.
4. Services may later use approved LangChain workflows and the shared RADIX
   skillset dictionary as appropriate.
5. Supabase PostgreSQL may later persist approved profiles, job information,
   and assessment results.
6. The API returns a typed response for the frontend to display.

The proposed end-to-end candidate flow is:

`Job Description → Resume Parsing → Candidate Profile → Talent Check → Skill Matching`

## Module boundaries

Each module has a separate service interface under `backend/app/services/` and
a corresponding frontend page. Domain objects live under `backend/app/models/`;
HTTP request/response schemas live under `backend/app/schemas/`. Configuration
and external integration boundaries are centralized in `backend/app/core/`,
`backend/app/agents/`, and `backend/app/database/`.

The authoritative 12-skillset dictionary, definitions, and scoring rules have
not been provided. They must be supplied and agreed upon before assessment or
matching behavior is implemented.
