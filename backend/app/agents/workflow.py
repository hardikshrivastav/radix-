"""Deferred orchestration interface for future LangChain workflows.

Workflows will connect module services after their contracts and behavior are
approved. No agents or workflows are executed by this scaffold.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from langchain_core.runnables import Runnable


def create_candidate_readiness_workflow() -> Runnable:
    """Build the future LangChain workflow after its steps are approved."""
    raise NotImplementedError("Workflow orchestration has not been implemented.")


def run_candidate_readiness_workflow(
    job_description_id: str, candidate_id: str
) -> None:
    """Placeholder for the proposed integrated candidate-readiness workflow."""
    raise NotImplementedError("Workflow orchestration has not been implemented.")
