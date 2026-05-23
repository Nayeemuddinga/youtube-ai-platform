from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

class Settings(BaseSettings):
    # === API Keys ===
    GROQ_API_KEY: str
    SECRET_KEY: str = "dev_secret_change_in_prod"
    
    # === Frontend/CORS ===
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # === Groq AI Configuration ===
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.3
    GROQ_MAX_TOKENS: int = 2048
    
    # === Redis/Caching ===
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600
    
    # === Rate Limiting ===
    RATE_LIMIT_PER_MINUTE: int = 30
    
    # === Authentication ===
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # === Database ===
    DATABASE_URL: str = "sqlite:///./youtube_ai.db"
    
    # === YouTube Integration (optional) ===
    YOUTUBE_API_KEY: Optional[str] = None
    
    # === LearningWithAhad Channel Config ===
    CHANNEL_NAME: str = "LearningWithAhad"
    CHANNEL_ID: str = "UCXTZ0nZUPz3lTOh4uferfew"  # Your actual channel ID
    TARGET_AUDIENCE: str = "Students, developers, and tech learners interested in AI, programming, and educational tutorials"
    
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
