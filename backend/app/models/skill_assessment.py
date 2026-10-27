"""Shared representation of the RADIX 12-skillset competency framework."""

from dataclasses import dataclass

SKILLSET_COUNT = 12


@dataclass(frozen=True)
class SkillsetFramework:
    """A configured set of authoritative skillset identifiers, without invented labels."""

    skillset_ids: tuple[str, ...]

    def __post_init__(self) -> None:
        if len(self.skillset_ids) != SKILLSET_COUNT:
            raise ValueError(
                f"The configured framework must contain {SKILLSET_COUNT} skillset identifiers."
            )
        if any(not skillset_id.strip() for skillset_id in self.skillset_ids):
            raise ValueError("Skillset identifiers must not be empty.")


@dataclass
class SkillAssessment:
    """A placeholder assessment record with no assumed scoring scale or formula."""

    candidate_id: str
    skillset_id: str
    evidence: str | None = None
    assessment_value: float | None = None
