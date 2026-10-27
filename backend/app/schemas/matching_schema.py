"""API schemas for Skill Matching (Role 5) and readiness assessment (Role 4)."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class MatchingRequest(BaseModel):
    """Legacy reference-based request (kept for backward compatibility)."""

    candidate_id: str
    job_description_id: str


class SkillMatchRequest(BaseModel):
    """Input for POST /api/skill-matches.

    Provide the JD as `jd_id` (saved Role 1 analysis) or inline `jd`
    (a JD skill list). Provide the candidate as `profile` (Role 3) or
    `resume` (Role 2) or a bare `candidate_skills` list.
    """

    jd_id: str | None = None
    jd: dict[str, Any] | None = None
    profile: dict[str, Any] | None = None
    resume: dict[str, Any] | None = None
    candidate_skills: list[Any] | None = None
    candidate_name: str | None = None
    use_llm: bool = True


class MatchedSkill(BaseModel):
    skill_name: str
    category_code: str = "OTHER"
    evidence: str = ""
    confidence: Literal["high", "medium", "low"] = "medium"
    candidate_skill: str = ""
    match_type: Literal["exact", "alias", "fuzzy", "semantic"] = "exact"
    similarity: float = 1.0
    weight: int = 1


class MissingSkill(BaseModel):
    skill_name: str
    category_code: str = "OTHER"
    evidence: str = ""
    confidence: Literal["high", "medium", "low"] = "medium"
    priority: Literal["critical", "important", "nice_to_have"] = "important"
    weight: int = 1


class CategoryBreakdown(BaseModel):
    category_code: str
    required: int
    matched: int
    score: int


class SkillMatchResult(BaseModel):
    """Role 5 output. Core contract fields: jd_source_file, match_score,
    matched_skills, missing_skills. Extras are additive."""

    jd_id: str | None = None
    jd_source_file: str = ""
    company: str | None = None
    role: str | None = None
    candidate_name: str | None = None
    candidate_source: str = "profile"
    match_score: int = Field(ge=0, le=100)
    verdict: str = ""
    summary: str = ""
    matched_skills: list[MatchedSkill] = Field(default_factory=list)
    missing_skills: list[MissingSkill] = Field(default_factory=list)
    category_breakdown: list[CategoryBreakdown] = Field(default_factory=list)
    extra_candidate_skills: list[str] = Field(default_factory=list)
    total_jd_skills: int = 0
    total_candidate_skills: int = 0
    used_llm: bool = False


class MatchingResult(BaseModel):
    """Deprecated placeholder retained for imports."""

    candidate_id: str
    job_description_id: str
    match_score: float | None = None
    skill_gaps: list[str] = Field(default_factory=list)
