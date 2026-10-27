"""Application-specific exception types."""


class IntegrationConfigurationError(RuntimeError):
    """Raised when a requested external integration is not configured."""
