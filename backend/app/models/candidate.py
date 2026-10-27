"""Domain model for a candidate profile."""

from dataclasses import dataclass, field


@dataclass
class Candidate:
    """Structured candidate information; extraction and persistence are not implemented."""

    id: str | None = None
    skills: list[str] = field(default_factory=list)
    experience: list[str] = field(default_factory=list)
    education: list[str] = field(default_factory=list)
