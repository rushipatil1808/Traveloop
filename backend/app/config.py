"""
Configuration management for Traveloop backend.
Loads environment variables and provides settings for the application.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import json


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Traveloop API"
    PROJECT_DESCRIPTION: str = "AI-powered travel planning application"
    VERSION: str = "1.0.0"
    
    # Database Configuration
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "traveloop"
    MYSQL_PASSWORD: str = "password"
    MYSQL_DATABASE: str = "traveloop"

    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "traveloop"
    
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000", "http://127.0.0.1:3000"]'
    
    # AI Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None
    MISTRAL_MODEL: str = "mistral-small"
    MISTRAL_API_URL: str = "https://api.mistral.ai/v1/chat/completions"
    AI_PROVIDER: str = "anthropic"
    ENABLE_RAG: bool = False
    
    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    RELOAD: bool = True
    DEBUG: str = 'False'

    @property
    def debug_mode(self) -> bool:
        return str(self.DEBUG).lower() in ('true', '1', 'yes')
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
