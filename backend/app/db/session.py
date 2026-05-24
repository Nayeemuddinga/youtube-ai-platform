import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# Get DATABASE_URL with fallbacks
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_DIRECT_URL")

# Fallback to SQLite for local development if no PostgreSQL URL
if not DATABASE_URL:
    logger.warning("⚠️ DATABASE_URL not found, using SQLite fallback")
    DATABASE_URL = "sqlite:///./youtube_ai.db"

# Fix Railway URL format: postgres:// → postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("✅ Fixed DATABASE_URL format for SQLAlchemy")

# Add SSL mode for production (Railway requires this)
if DATABASE_URL.startswith("postgresql://") and "sslmode" not in DATABASE_URL:
    separator = "?" if "?" not in DATABASE_URL else "&"
    DATABASE_URL += f"{separator}sslmode=require"
    logger.info("✅ Added sslmode=require to DATABASE_URL")

logger.info(f"🔗 Connecting to database: {DATABASE_URL[:50]}...")

# Create engine with production-safe settings
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Handle connection drops
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create tables - call on startup"""
    from app.models.user import User
    from app.models.marketing_package import MarketingPackage
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables initialized")