"""Centralized environment-backed application settings."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from backend/.env or system environment."""

    supabase_url: str | None = None
    supabase_key: str | None = None
    companies_table: str = "staging_company"

    llm_provider: str = "google_genai"
    llm_model: str = "gemini-2.5-flash"
    gemini_model: str | None = None
    llm_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=(_ENV_PATH, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def effective_llm_model(self) -> str:
        """Return effective LLM model name, supporting both LLM_MODEL and GEMINI_MODEL."""
        if self.gemini_model and self.llm_model == "gemini-2.5-flash":
            return self.gemini_model
        return self.llm_model or self.gemini_model or "gemini-2.5-flash"


@lru_cache
def get_settings() -> Settings:
    """Load settings once, without connecting to external services."""
    return Settings()
