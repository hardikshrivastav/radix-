"""API schemas and data contracts for Job Description (JD) Analytics.

Adheres strictly to the RADIX Talent Match shared data contract.
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field

# The 12 approved competency framework category codes plus OTHER
CategoryCode = Literal[
    "COD",    # Coding
    "DSA",    # Data Structures & Algorithms
    "OOD",    # Object-Oriented Design
    "APTI",   # Aptitude & Problem Solving
    "COMM",   # Communication & Collaboration
    "AI",     # Artificial Intelligence & Machine Learning
    "CLOUD",  # Cloud & DevOps
    "SQL",    # Databases & SQL
    "SWE",    # Software Engineering Practices
    "SYSD",   # System Design & Architecture
    "NETW",   # Networking & Protocols
    "OS",     # Operating Systems & Systems Programming
    "OTHER",  # Miscellaneous or unmapped domain skills
]

ConfidenceLevel = Literal["high", "medium", "low"]


class SkillItem(BaseModel):
    """Single extracted skill item mapped to the 12-category framework."""

    skill_name: str = Field(description="Normalized name of the skill or technology")
    category_code: CategoryCode = Field(
        description="One of the 12 approved category codes or OTHER"
    )
    evidence: str = Field(
        description="Short verbatim quote or precise reason copied from the text"
    )
    confidence: ConfidenceLevel = Field(
        description="high (explicitly required), medium (implied or preferred), low (inferred)"
    )


class JDSkillList(BaseModel):
    """Output contract for Role 1 (JD Analytics), consumed by Role 5 (Skill Matching)."""

    source_type: Literal["jd"] = "jd"
    source_file: str = Field(description="Name or identifier of the source file or 'pasted_text'")
    company: str | None = Field(default=None, description="Company name if detected or specified")
    role: str | None = Field(default=None, description="Job title / role if detected or specified")
    skills: list[SkillItem] = Field(default_factory=list, description="Extracted skills")


class SavedJDSkillRecord(JDSkillList):
    """Persisted analysis record including persistence metadata."""

    id: str = Field(description="Unique identifier (e.g. UUID) of the saved analysis")
    created_at: str = Field(description="ISO-8601 formatted UTC creation timestamp")


class JDAnalyticsSummary(BaseModel):
    """Brief summary item returned when listing saved JD analyses."""

    id: str
    company: str | None = None
    role: str | None = None
    source_file: str
    skill_count: int
    created_at: str


class JobDescriptionTextRequest(BaseModel):
    """Input contract for text-based job description analysis."""

    description: str = Field(..., min_length=10, description="Raw text of the job description")
    title: str | None = Field(default=None, description="Optional job title or role name")
    company: str | None = Field(default=None, description="Optional target company name")


# Backward compatibility alias
JobDescriptionRequest = JobDescriptionTextRequest


class CompanyItem(BaseModel):
    """Company representation returned by the companies API."""

    id: str
    name: str
