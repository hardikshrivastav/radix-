"""Unit and integration tests for JD Analytics (Role 1).

All tests run completely offline with mocked LLM and isolated storage.
"""

from __future__ import annotations

import io
from unittest.mock import MagicMock, patch

import pytest
from docx import Document
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from main import app
from app.schemas.job_schema import SkillItem
from app.services.jd_analytics import (
    _LLMExtractedPayload,
    analyze_job_description,
    normalize_skill_name,
    post_process_skills,
)
from app.services.jd_file_reader import (
    clean_text,
    extract_focused_sections,
    process_jd_input,
)


@pytest.fixture
def client():
    return TestClient(app)


def create_sample_pdf_bytes(text: str = "Software Engineer. Requirements: Python, AWS, Docker.") -> bytes:
    """Generate a valid minimal PDF containing text for testing."""
    # Using pypdf's PdfWriter with annotations/form or pdf creation
    # Or create a minimal valid PDF stream manually
    buffer = io.BytesIO()
    # Write a standard minimal PDF structure with a text stream
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n"
        b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"5 0 obj << /Length 73 >> stream\n"
        b"BT /F1 12 Tf 100 700 Td (Software Engineer. Requirements: Python, AWS, Docker.) Tj ET\n"
        b"endstream\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n"
        b"0000000117 00000 n \n0000000244 00000 n \n0000000318 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n443\n%%EOF\n"
    )
    buffer.write(pdf_content)
    return buffer.getvalue()


def create_sample_docx_bytes(
    paragraphs: list[str] = None,
    table_data: list[list[str]] = None,
) -> bytes:
    """Generate a valid DOCX file in-memory."""
    doc = Document()
    if paragraphs is None:
        paragraphs = [
            "Company: Acme Corp",
            "Job Title: Senior Backend Engineer",
            "Key Responsibilities",
            "Build scalable REST microservices in Python.",
            "Qualifications",
            "5+ years of experience with PostgreSQL and Kubernetes.",
        ]
    for p in paragraphs:
        doc.add_paragraph(p)

    if table_data:
        table = doc.add_table(rows=len(table_data), cols=len(table_data[0]))
        for r_idx, row in enumerate(table_data):
            for c_idx, cell_value in enumerate(row):
                table.rows[r_idx].cells[c_idx].text = cell_value

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


# --- Unit Tests: Text Processing & Section Focus ---

def test_clean_text_removes_noise_and_normalizes():
    noisy = "Page 1 of 4\r\nHello    World!\n\n\n\nRequirements:\n   - Python"
    cleaned = clean_text(noisy)
    assert "Page 1 of 4" not in cleaned
    assert "Hello World!" in cleaned
    assert "\r" not in cleaned
    assert "\n\n\n\n" not in cleaned


def test_extract_focused_sections():
    jd_sample = (
        "About Acme:\nWe are a tech company.\n\n"
        "Requirements:\n"
        "- 3+ years experience with Python and Go\n"
        "- Experience with Kubernetes and CI/CD pipelines\n\n"
        "Benefits:\n"
        "- 401(k) matching\n"
        "- Health insurance\n"
    )
    focused = extract_focused_sections(jd_sample)
    assert "Requirements" in focused
    assert "Python and Go" in focused
    assert "401(k)" not in focused


def test_process_jd_input_too_short():
    with pytest.raises(ValueError, match="too short"):
        process_jd_input("Too short")


def test_pdf_reader():
    pdf_bytes = create_sample_pdf_bytes("Software Engineer. Requirements: Python, AWS, Docker.")
    processed = process_jd_input(pdf_bytes, filename="job.pdf")
    assert "Software Engineer" in processed.cleaned_text
    assert "Python" in processed.cleaned_text


def test_empty_pdf_raises_error():
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    buf = io.BytesIO()
    writer.write(buf)
    with pytest.raises(ValueError, match="No extractable text found in PDF"):
        process_jd_input(buf.getvalue(), filename="empty.pdf")


# --- Unit Tests: Normalization, Deduplication & Validation ---

def test_normalize_skill_names():
    assert normalize_skill_name("py") == "Python"
    assert normalize_skill_name("postgres") == "PostgreSQL"
    assert normalize_skill_name("k8s") == "Kubernetes"
    assert normalize_skill_name("AWS") == "AWS"
    assert normalize_skill_name("UNKNOWN_TOOL") == "UNKNOWN_TOOL"


def test_post_process_skills_deduplication_and_category_fallback():
    raw = [
        {
            "skill_name": "py",
            "category_code": "COD",
            "evidence": "Proficiency in Python required",
            "confidence": "high",
        },
        {
            "skill_name": "Python",
            "category_code": "COD",
            "evidence": "Scripting tasks with Python",
            "confidence": "medium",
        },
        {
            "skill_name": "Fortran",
            "category_code": "INVALID_CODE",
            "evidence": "Legacy Fortran maintenance",
            "confidence": "low",
        },
    ]

    processed = post_process_skills(raw)

    # Python should be deduplicated to 1 item with high confidence and combined evidence
    py_items = [s for s in processed if s.skill_name == "Python"]
    assert len(py_items) == 1
    assert py_items[0].confidence == "high"
    assert "Proficiency in Python required" in py_items[0].evidence

    # Invalid category should map to OTHER
    fortran = [s for s in processed if s.skill_name == "Fortran"][0]
    assert fortran.category_code == "OTHER"


# --- Unit Tests: LLM Service Pipeline (Mocked LLM) ---

def test_analyze_job_description_with_mock_llm():
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value.invoke.return_value = _LLMExtractedPayload(
        company="TechCorp",
        role="Backend Architect",
        skills=[
            SkillItem(
                skill_name="python",
                category_code="COD",
                evidence="5+ years of Python experience",
                confidence="high",
            ),
            SkillItem(
                skill_name="Postgres",
                category_code="SQL",
                evidence="Deep experience with PostgreSQL",
                confidence="high",
            ),
        ],
    )

    sample_text = (
        "TechCorp is looking for a Backend Architect.\n"
        "Requirements:\n"
        "- 5+ years of Python experience.\n"
        "- Deep experience with PostgreSQL."
    )

    result = analyze_job_description(
        sample_text,
        source_file="sample.txt",
        company=None,  # Should pick up TechCorp from LLM
        role=None,
        llm=mock_llm,
    )

    assert result.source_type == "jd"
    assert result.company == "TechCorp"
    assert result.role == "Backend Architect"
    assert len(result.skills) == 2
    assert result.skills[0].skill_name in ["Python", "PostgreSQL"]


def test_analyze_job_description_override_company_role():
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value.invoke.return_value = _LLMExtractedPayload(
        company="DetectedCo",
        role="DetectedRole",
        skills=[],
    )

    result = analyze_job_description(
        "Requirements: Must know Python and algorithms.",
        source_file="sample.txt",
        company="OverrideCompany",
        role="OverrideRole",
        llm=mock_llm,
    )

    assert result.company == "OverrideCompany"
    assert result.role == "OverrideRole"


# --- API Route Tests ---

def test_health_route(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_companies_unconfigured(client):
    """When Supabase is not configured, GET /api/companies returns 503."""
    with patch("app.api.routes.get_supabase_client") as mock_client:
        from app.core.exceptions import IntegrationConfigurationError
        mock_client.side_effect = IntegrationConfigurationError("Supabase is not configured.")
        response = client.get("/api/companies")
        assert response.status_code == 503
        assert "detail" in response.json()
        assert "not configured" in response.json()["detail"].lower()


@patch("app.services.jd_analytics.create_llm")
def test_post_jd_analytics_text_route(mock_create_llm, client):
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value.invoke.return_value = _LLMExtractedPayload(
        company="OpenAI",
        role="Research Engineer",
        skills=[
            SkillItem(
                skill_name="PyTorch",
                category_code="AI",
                evidence="Experience with PyTorch",
                confidence="high",
            )
        ],
    )
    mock_create_llm.return_value = mock_llm

    payload = {
        "description": "We are seeking a Research Engineer with PyTorch experience.",
        "title": "Research Engineer",
        "company": "OpenAI",
    }
    response = client.post("/api/jd-analytics/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source_type"] == "jd"
    assert data["company"] == "OpenAI"
    assert "id" in data
    assert len(data["skills"]) == 1
    assert data["skills"][0]["skill_name"] == "PyTorch"
    assert data["skills"][0]["category_code"] == "AI"


@patch("app.services.jd_analytics.create_llm")
def test_post_jd_analytics_docx_upload(mock_create_llm, client):
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value.invoke.return_value = _LLMExtractedPayload(
        company="Microsoft",
        role="Software Engineer",
        skills=[
            SkillItem(
                skill_name="C#",
                category_code="COD",
                evidence="Expertise in C#",
                confidence="high",
            )
        ],
    )
    mock_create_llm.return_value = mock_llm

    docx_bytes = create_sample_docx_bytes(
        paragraphs=["Job Title: Software Engineer", "Requirements: Expertise in C#"]
    )

    response = client.post(
        "/api/jd-analytics",
        files={"file": ("jd.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={"company": "Microsoft", "role": "Software Engineer"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["company"] == "Microsoft"
    assert data["role"] == "Software Engineer"
    assert data["source_file"] == "jd.docx"
    assert len(data["skills"]) == 1


def test_post_jd_analytics_invalid_filetype(client):
    response = client.post(
        "/api/jd-analytics",
        files={"file": ("unsupported.exe", b"invalid executable", "application/octet-stream")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_get_saved_jd_analytics_list_and_detail(client):
    # Test listing previously saved records
    response = client.get("/api/jd-analytics")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Test 404 on nonexistent ID
    missing_response = client.get("/api/jd-analytics/nonexistent-id-12345")
    assert missing_response.status_code == 404
    assert "not found" in missing_response.json()["detail"].lower()


def test_other_roles_stubs_return_501(client):
    assert client.post("/api/resume-parsing").status_code == 501
    assert client.post("/api/profiles").status_code == 501
    assert client.get("/api/profiles/candidate-1").status_code == 501
    assert client.post("/api/talent-checks").status_code == 501
