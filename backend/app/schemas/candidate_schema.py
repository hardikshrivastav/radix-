"""API schemas for candidate profile operations."""

from pydantic import BaseModel, Field


class CandidateProfileRequest(BaseModel):
    """Input contract for creating or updating a candidate profile."""

    candidate_id: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)


class CandidateProfileResponse(BaseModel):
    """Response contract for a future candidate profile operation."""

    candidate_id: str
    status: str
