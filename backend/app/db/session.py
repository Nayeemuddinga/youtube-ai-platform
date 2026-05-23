from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings

settings = get_settings()

# Fix Railway URL format: postgres:// → postgresql://
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Add SSL mode for production (Railway requires this)
if db_url and "sslmode" not in db_url and db_url.startswith("postgresql://"):
    separator = "?" if "?" not in db_url else "&"
    db_url += f"{separator}sslmode=require"

engine = create_engine(
    db_url,
    pool_pre_ping=True,  # Handle connection drops
    pool_size=5,         # Connection pool settings
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables - call this on startup"""
    from app.models.user import User
    from app.models.marketing_package import MarketingPackage
    Base.metadata.create_all(bind=engine)