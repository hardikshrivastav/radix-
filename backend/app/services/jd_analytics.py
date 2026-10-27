"""JD Analytics service implementation.

Extracts technical skills, competencies, and requirements from Job Descriptions
using LangChain and Google Gemini LLM, following the RADIX 12-category competency framework.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from app.agents.llm_factory import create_llm
from app.core.exceptions import IntegrationConfigurationError
from app.schemas.job_schema import (
    CategoryCode,
    ConfidenceLevel,
    JDAnalyticsSummary,
    JDSkillList,
    SavedJDSkillRecord,
    SkillItem,
)
from app.services.jd_file_reader import process_jd_input

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "jd_results"

VALID_CATEGORIES: set[str] = {
    "COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD",
    "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER",
}

CONFIDENCE_RANK: dict[str, int] = {
    "high": 3,
    "medium": 2,
    "low": 1,
}

SKILL_ALIASES: dict[str, str] = {
    "python": "Python",
    "py": "Python",
    "python3": "Python",
    "python 3": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "rust": "Rust",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    "ruby": "Ruby",
    "php": "PHP",
    "scala": "Scala",
    "kotlin": "Kotlin",
    "swift": "Swift",
    # Databases & SQL
    "sql": "SQL",
    "nosql": "NoSQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "oracle": "Oracle DB",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "google cloud platform": "Google Cloud Platform",
    "azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "jenkins": "Jenkins",
    # Web & Frameworks
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    # AI & ML
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "llm": "LLMs",
    "llms": "LLMs",
    "genai": "Generative AI",
    "generative ai": "Generative AI",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing (NLP)",
    # SWE & Tools
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "pytest": "pytest",
    "junit": "JUnit",
    "jira": "Jira",
    "agile": "Agile / Scrum",
    "scrum": "Agile / Scrum",
    "oop": "Object-Oriented Programming (OOP)",
    "dsa": "Data Structures & Algorithms",
    "linux": "Linux",
    "system design": "System Design",
    "microservices": "Microservices",
    "distributed systems": "Distributed Systems",
}

EXTRACTION_SYSTEM_PROMPT = """You are an expert technical recruiter and skill analyst for the RADIX Talent Match platform.
Your job is to read a Job Description (JD) and extract all technical skills, competencies, and requirements into structured data.

### The 12 RADIX Competency Framework Categories:
Every requirement and skill MUST be mapped to exactly ONE category code from this list:
1. COD (Coding): Core programming languages and syntax (e.g. Python, Java, C++, TypeScript, Go, Rust, Ruby, C#).
2. DSA (Data Structures & Algorithms): Algorithmic complexity, trees, graphs, heaps, dynamic programming, sorting.
3. OOD (Object-Oriented Design): OOP principles, design patterns (Singleton, Factory, Observer), class modeling, SOLID.
4. APTI (Aptitude & Problem Solving): Analytical reasoning, problem-solving ability, debugging complex problems, quantitative logic.
5. COMM (Communication & Collaboration): Written/verbal communication, cross-functional collaboration, teamwork, presentation skills.
6. AI (Artificial Intelligence & ML): Machine learning, deep learning, NLP, computer vision, LLMs, GenAI, PyTorch, TensorFlow.
7. CLOUD (Cloud & DevOps): AWS, Azure, GCP, Docker, Kubernetes, CI/CD pipelines, Terraform, Linux deployment, monitoring.
8. SQL (Databases & SQL): Relational databases (PostgreSQL, MySQL, Oracle), NoSQL (MongoDB, Redis), query optimization, indexing.
9. SWE (Software Engineering): Git version control, unit testing (pytest, JUnit), TDD, agile/scrum, code review, CI integration.
10. SYSD (System Design): Distributed systems, microservices, load balancing, caching, scalability, latency, high availability.
11. NETW (Networking): TCP/IP, HTTP/HTTPS, DNS, WebSockets, REST APIs, gRPC, security protocols, VPCs.
12. OS (Operating Systems): Concurrency, multi-threading, memory management, Linux internals, shell scripting, process scheduling.
13. OTHER: Anything technical or domain-specific that does not fit the 12 categories above.

### Extraction Rules:
- Plain prose & implicit requirements: JDs are written in natural prose. Map every requirement to its appropriate category (e.g., "experience building high-throughput services" -> SYSD).
- Named technologies: Also extract specific technologies, libraries, tools, frameworks, and databases mentioned (e.g. Docker -> CLOUD, PostgreSQL -> SQL).
- Soft skills: Soft skill phrases such as communication, teamwork, leadership, cross-functional alignment map to COMM. Analytical thinking and problem solving map to APTI.
- Evidence quote: Each skill MUST include an exact short quote or direct reason copied from the text as `evidence`.
- Confidence level:
  - 'high': explicitly required or mandatory (e.g., "Must have 3+ years...", "Proficiency in...", "Required:").
  - 'medium': implied or preferred (e.g., "Preferred qualifications", "Nice to have", "Experience with X is a plus").
  - 'low': inferred contextually.
- Do NOT hallucinate: Only extract skills that are genuinely supported by the text.
- Detect Company and Role: If the company or job title is mentioned in the text, extract them into the top-level fields.
"""


class _RawSkillItem(BaseModel):
    """Lenient skill representation returned by the LLM before normalization and validation."""
    skill_name: str
    category_code: str = "OTHER"
    evidence: str = ""
    confidence: str = "medium"


class _LLMExtractedPayload(BaseModel):
    """Structure returned by LLM extraction."""
    company: str | None = Field(default=None, description="Company or employer name mentioned in the JD")
    role: str | None = Field(default=None, description="Job title or role name mentioned in the JD")
    skills: list[_RawSkillItem | SkillItem] = Field(default_factory=list, description="List of extracted skills")


def normalize_skill_name(name: str) -> str:
    """Normalize skill name using common alias lookups and clean capitalization."""
    stripped = name.strip()
    clean_lower = stripped.lower()
    if clean_lower in SKILL_ALIASES:
        return SKILL_ALIASES[clean_lower]
    # Keep uppercase acronyms (e.g. AWS, SQL, GCP) intact, otherwise title case if single word lowercase
    if len(stripped) <= 4 and stripped.isupper():
        return stripped
    if stripped.islower() and len(stripped) > 2:
        return stripped.title()
    return stripped


def post_process_skills(raw_skills: list[Any]) -> list[SkillItem]:
    """Validate categories, normalize names, deduplicate case-insensitively, and sort."""
    merged: dict[str, SkillItem] = {}

    for raw in raw_skills:
        if isinstance(raw, dict):
            name_val = raw.get("skill_name", "")
            cat_val = raw.get("category_code", "OTHER")
            ev_val = raw.get("evidence", "")
            conf_val = raw.get("confidence", "medium")
        else:
            name_val = getattr(raw, "skill_name", "")
            cat_val = getattr(raw, "category_code", "OTHER")
            ev_val = getattr(raw, "evidence", "")
            conf_val = getattr(raw, "confidence", "medium")

        name = normalize_skill_name(name_val)
        if not name:
            continue

        # Validate category code
        category = str(cat_val).upper().strip() if cat_val else "OTHER"
        if category not in VALID_CATEGORIES:
            category = "OTHER"

        # Validate confidence
        conf_str = str(conf_val).lower().strip() if conf_val else "medium"
        confidence: ConfidenceLevel = (
            conf_str if conf_str in CONFIDENCE_RANK else "medium"  # type: ignore
        )

        evidence = str(ev_val).strip()
        key = name.lower()

        if key in merged:
            existing = merged[key]
            # Keep higher confidence
            if CONFIDENCE_RANK.get(confidence, 1) > CONFIDENCE_RANK.get(existing.confidence, 1):
                existing.confidence = confidence
            # Prefer non-OTHER category
            if existing.category_code == "OTHER" and category != "OTHER":
                existing.category_code = category  # type: ignore
            # Merge evidence if distinct
            if evidence and evidence not in existing.evidence:
                if len(existing.evidence) < 300:
                    existing.evidence = f"{existing.evidence}; {evidence}"
        else:
            merged[key] = SkillItem(
                skill_name=name,
                category_code=category,  # type: ignore
                evidence=evidence or "Mentioned in job description requirements",
                confidence=confidence,
            )

    # Sort: by category code, then confidence (high -> medium -> low), then skill name
    def sort_key(s: SkillItem):
        return (s.category_code, -CONFIDENCE_RANK.get(s.confidence, 1), s.skill_name.lower())

    return sorted(merged.values(), key=sort_key)


def _call_llm_with_retry(llm: Any, prompt_messages: list[Any]) -> _LLMExtractedPayload:
    """Invoke LLM with structured output, JSON fallback, and rate limit backoff."""
    max_retries = 2
    last_exception: Exception | None = None

    for attempt in range(max_retries):
        try:
            # 1. Try structured output
            try:
                structured_chain = llm.with_structured_output(_LLMExtractedPayload)
                result = structured_chain.invoke(prompt_messages)
                if isinstance(result, _LLMExtractedPayload):
                    return result
                if isinstance(result, dict):
                    return _LLMExtractedPayload.model_validate(result)
            except Exception as structured_err:
                logger.warning("Structured output attempt failed (%s), trying raw JSON parse: %s", attempt, structured_err)

            # 2. Fallback: ask for raw JSON string and parse
            raw_response = llm.invoke(prompt_messages)
            content = getattr(raw_response, "content", "")
            if isinstance(content, list):
                content = " ".join(str(c) for c in content)

            # Find JSON block in content
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                parsed_data = json.loads(json_match.group(0))
                return _LLMExtractedPayload.model_validate(parsed_data)

            raise ValueError("Could not extract valid JSON from LLM response.")

        except Exception as exc:
            err_str = str(exc)
            last_exception = exc
            # Check for Gemini rate limit (429 or ResourceExhausted)
            if "429" in err_str or "ResourceExhausted" in err_str or "quota" in err_str.lower():
                logger.warning("Gemini rate limit encountered on attempt %s. Backing off for 4s...", attempt + 1)
                time.sleep(4.0)
                continue
            # For validation or other transient error, retry once
            if attempt < max_retries - 1:
                time.sleep(1.5)
                continue

    # If all attempts failed
    err_str = str(last_exception)
    if "429" in err_str or "ResourceExhausted" in err_str or "quota" in err_str.lower():
        raise RuntimeError("LLM rate limit or quota exceeded. Please wait a few seconds and retry.") from last_exception
    raise RuntimeError(f"LLM extraction failed: {last_exception}") from last_exception


def analyze_job_description(
    text: str,
    *,
    source_file: str = "pasted_text.txt",
    company: str | None = None,
    role: str | None = None,
    llm: Any | None = None,
) -> JDSkillList:
    """Analyze a Job Description and extract technical requirements mapped to the 12 categories.

    Callable as a plain Python function for direct reuse by Role 5 (Skill Matching).
    """
    if not text or len(text.strip()) < 15:
        raise ValueError("Job description text is too short to analyze.")

    # Process text, clean it, and locate priority sections
    processed = process_jd_input(text, filename=source_file)

    # Instantiate LLM lazily if not passed in
    if llm is None:
        llm = create_llm()

    from langchain_core.messages import HumanMessage, SystemMessage

    user_prompt_parts = []
    if company:
        user_prompt_parts.append(f"Target Company: {company}")
    if role:
        user_prompt_parts.append(f"Target Role: {role}")

    if processed.focused_sections:
        user_prompt_parts.append(
            "=== HIGH-SIGNAL SECTIONS (REQUIREMENTS & RESPONSIBILITIES) ===\n"
            + processed.focused_sections
        )

    user_prompt_parts.append(
        "=== COMPLETE JOB DESCRIPTION TEXT ===\n"
        + processed.cleaned_text
    )

    user_prompt_text = "\n\n".join(user_prompt_parts)

    messages = [
        SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt_text),
    ]

    extracted_payload = _call_llm_with_retry(llm, messages)

    # Post process skills (validate categories, deduplicate, normalize, sort)
    processed_skills = post_process_skills(extracted_payload.skills)

    # User-supplied company and role override LLM-detected values
    final_company = company or extracted_payload.company or None
    final_role = role or extracted_payload.role or None

    return JDSkillList(
        source_type="jd",
        source_file=source_file,
        company=final_company,
        role=final_role,
        skills=processed_skills,
    )


# --- Local JSON Persistence ---

def get_storage_dir() -> Path:
    """Ensure and return the local persistence directory."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR


def save_jd_result(jd_list: JDSkillList, jd_id: str | None = None) -> SavedJDSkillRecord:
    """Save an analysis result locally as JSON."""
    storage_dir = get_storage_dir()
    record_id = jd_id or str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    record = SavedJDSkillRecord(
        id=record_id,
        source_type=jd_list.source_type,
        source_file=jd_list.source_file,
        company=jd_list.company,
        role=jd_list.role,
        skills=jd_list.skills,
        created_at=now_iso,
    )

    file_path = storage_dir / f"{record_id}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(record.model_dump_json(indent=2))

    return record


def get_jd_result(jd_id: str) -> SavedJDSkillRecord | None:
    """Retrieve a previously saved JD analysis by ID."""
    storage_dir = get_storage_dir()
    file_path = storage_dir / f"{jd_id}.json"
    if not file_path.exists():
        return None

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return SavedJDSkillRecord.model_validate(data)
    except Exception as exc:
        logger.error("Failed to read saved JD result %s: %s", jd_id, exc)
        return None


def list_jd_results() -> list[JDAnalyticsSummary]:
    """List summary cards of all saved JD analyses, ordered newest first."""
    storage_dir = get_storage_dir()
    summaries: list[JDAnalyticsSummary] = []

    for file_path in storage_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            summaries.append(
                JDAnalyticsSummary(
                    id=data.get("id", file_path.stem),
                    company=data.get("company"),
                    role=data.get("role"),
                    source_file=data.get("source_file", "unknown"),
                    skill_count=len(data.get("skills", [])),
                    created_at=data.get("created_at", ""),
                )
            )
        except Exception:
            continue

    # Sort descending by created_at
    summaries.sort(key=lambda s: s.created_at, reverse=True)
    return summaries
