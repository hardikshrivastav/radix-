"""Factory for instantiating LangChain LLM interfaces.

Structured by provider to allow future providers (e.g. OpenAI, Anthropic, local Ollama)
while implementing Google GenAI (Gemini) for Role 1 and the hackathon.
Lazy: zero network activity, credential validation, or SDK import at module load time.
"""

from __future__ import annotations

from typing import TYPE_CHECKING
from app.core.config import get_settings
from app.core.exceptions import IntegrationConfigurationError

if TYPE_CHECKING:
    from langchain_core.language_models.chat_models import BaseChatModel


def _create_google_genai_llm(model_name: str, api_key: str, temperature: float = 0.0) -> BaseChatModel:
    """Instantiate a ChatGoogleGenerativeAI client."""
    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=temperature,
    )


def create_llm(
    *,
    provider: str | None = None,
    model: str | None = None,
    temperature: float = 0.0,
) -> BaseChatModel:
    """Create a configured LangChain chat model based on environment configuration.

    Raises:
        IntegrationConfigurationError: if required API keys are missing or provider unsupported.
    """
    settings = get_settings()

    selected_provider = (provider or settings.llm_provider or "google_genai").strip().lower()
    selected_model = (model or settings.effective_llm_model or "gemini-2.5-flash").strip()
    api_key = settings.llm_api_key

    if selected_provider in {"google_genai", "google", "gemini"}:
        if not api_key:
            raise IntegrationConfigurationError(
                "Google Gemini LLM is not configured. "
                "Please set LLM_API_KEY in backend/.env with your Google AI Studio key."
            )
        return _create_google_genai_llm(selected_model, api_key, temperature=temperature)

    raise IntegrationConfigurationError(
        f"Unsupported LLM provider '{selected_provider}'. "
        "Supported providers: 'google_genai'."
    )
