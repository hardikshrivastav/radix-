"""Domain model for a job description."""

from dataclasses import dataclass


@dataclass
class JobDescription:
    """A job description provided for future analysis and matching."""

    description: str
    title: str | None = None
    company: str | None = None
    id: str | None = None
