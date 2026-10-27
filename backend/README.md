# RADIX Talent Match – Backend API

FastAPI backend application for the RADIX Talent Match platform.
**Role 1 (JD Analytics)** is fully implemented with LangChain and Google Gemini LLM extraction, deterministic text cleaning and section focusing, and local JSON persistence.

---

## 1. Environment Configuration

Copy the example environment file and populate your local credentials in `backend/.env`:

```powershell
Copy-Item .env.example .env
```

| Environment Variable | Description | Default / Example |
|---|---|---|
| `LLM_PROVIDER` | AI provider (currently `google_genai`) | `google_genai` |
| `LLM_MODEL` | Gemini model name | `gemini-2.5-flash` (or `gemini-2.0-flash`) |
| `LLM_API_KEY` | Google AI Studio API key | *(your private key)* |
| `SUPABASE_URL` | Supabase project REST URL | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase anon or service_role key | *(your private key)* |
| `COMPANIES_TABLE` | Supabase table for company listings (read-only) | `staging_company` |

*Security Rule: Never commit `.env` or print credentials in logs or frontend code.*

---

## 2. Setup & Running (PowerShell)

```powershell
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Python 3.12 or 3.13)
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
python -m pip install -r requirements.txt

# Start FastAPI development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

---

## 3. PowerShell Examples for Endpoints

### Health Check (`GET /health`)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
```

### List Companies (`GET /api/companies`)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/companies" -Method Get
```

### Extract Skills from Plain Text JD (`POST /api/jd-analytics/text`)
```powershell
$body = @{
    description = "We are seeking a Senior Backend Engineer. Requirements: 5+ years with Python, PostgreSQL, and Kubernetes. Experience with distributed systems and AWS is required."
    title = "Senior Backend Engineer"
    company = "Google"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/jd-analytics/text" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Extract Skills from Uploaded File (`POST /api/jd-analytics`)
```powershell
# Using curl.exe (standard in Windows PowerShell)
curl.exe -X POST "http://127.0.0.1:8000/api/jd-analytics" `
    -F "file=@backend/data/samples/microsoft_swe_sample.docx" `
    -F "company=Microsoft" `
    -F "role=Software Engineer II"
```

### List Saved Analyses (`GET /api/jd-analytics`)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/jd-analytics" -Method Get
```

### Retrieve Saved Analysis by ID (`GET /api/jd-analytics/{id}`)
*Consumed by Role 5 (Skill Matching)*
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/jd-analytics/<record-id>" -Method Get
```

---

## 4. CLI Sample Runner

Test extraction on any local JD file (PDF, DOCX, or text) directly from the command line:

```powershell
python backend/scripts/run_jd_sample.py "backend/data/samples/microsoft_swe_sample.docx" --company "Microsoft"
python backend/scripts/run_jd_sample.py "backend/data/samples/google_swe_sample.pdf" --company "Google"
```

---

## 5. Running Tests

Run the test suite offline with mocked LLM:

```powershell
pytest backend/tests -v
```
