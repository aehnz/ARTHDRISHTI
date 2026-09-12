from functools import lru_cache

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment configuration; safe defaults keep the demo self-contained."""

    backend_env: str = Field(default="development", validation_alias=AliasChoices("ENVIRONMENT", "BACKEND_ENV"))
    repository_backend: str = "memory"
    database_url: str = ""
    cors_origins: str = "http://localhost:3000"
    frontend_origin: str = ""
    ai_provider: str = "fallback"
    opusmax_base_url: str = "https://api.opusmax.pro"
    opusmax_api_key: str = ""
    opusmax_model: str = ""
    ai_fast_model: str = ""
    ai_default_model: str = ""
    ai_reasoning_model: str = ""
    request_timeout_seconds: float = 15.0
    session_cookie_name: str = "arthdrishti_session"
    session_cookie_secure: bool = False
    session_ttl_minutes: int = Field(default=480, validation_alias=AliasChoices("SESSION_TTL", "SESSION_TTL_MINUTES"))
    otp_ttl_seconds: int = 300
    otp_max_attempts: int = 5
    mock_otp: str = "123456"
    transaction_page_size: int = 250
    audit_page_size: int = 250

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    @property
    def allowed_origins(self) -> list[str]:
        configured = self.cors_origins or self.frontend_origin
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_storage(self) -> "Settings":
        if self.backend_env.casefold() == "production" and self.repository_backend.casefold() != "postgres":
            raise ValueError("Production requires REPOSITORY_BACKEND=postgres")
        if self.repository_backend.casefold() == "postgres" and not self.database_url:
            raise ValueError("DATABASE_URL is required when REPOSITORY_BACKEND=postgres")
        if self.backend_env.casefold() == "production":
            self.session_cookie_secure = True
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
