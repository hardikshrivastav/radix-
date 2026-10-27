"""Lazy Supabase client access; importing this module makes no network connection."""

from functools import lru_cache

from app.core.config import get_settings
from app.core.exceptions import IntegrationConfigurationError


@lru_cache
def get_supabase_client():
    """Return a configured Supabase client, initializing it only when requested."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        raise IntegrationConfigurationError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in the backend environment."
        )

    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_key)
