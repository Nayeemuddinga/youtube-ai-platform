from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

class Settings(BaseSettings):
    GROQ_API_KEY: str
    SECRET_KEY: str
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.3
    GROQ_MAX_TOKENS: int = 2048
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600
    RATE_LIMIT_PER_MINUTE: int = 30
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    DATABASE_URL: str = "sqlite:///./youtube_ai.db"
    CHANNEL_NAME: str = "LearningWithAhad"
    CHANNEL_ID: str = "UCXTZ0nZUPz3lTOh4uferfew"
    TARGET_AUDIENCE: str = "Students, developers, and tech learners"
    CONTENT_NICHE: str = "AI, programming, educational tutorials"
    DEBUG: bool = False
    
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
