import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# Get DATABASE_URL - Railway provides this automatically
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.warning("⚠️ DATABASE_URL not found, using SQLite fallback")
    DATABASE_URL = "sqlite:///./youtube_ai.db"
elif DATABASE_URL.startswith("postgres://"):
    # Railway uses postgres://, but SQLAlchemy needs postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("✅ Fixed DATABASE_URL format for PostgreSQL")

logger.info(f"🔗 Connecting to database: {DATABASE_URL[:50]}...")

# Create engine
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Import ALL models here
from app.models.user import User
# from app.models.marketing_package import MarketingPackage  # Uncomment when ready

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables initialized")