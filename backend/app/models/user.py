"""
User Model - SQLAlchemy ORM
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship, declarative_base, Mapped
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    email: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = Column(String, unique=True, index=True)
    full_name: Mapped[str] = Column(String)
    hashed_password: Mapped[str] = Column(String, nullable=False)
    is_active: Mapped[bool] = Column(Boolean, default=True)
    is_verified: Mapped[bool] = Column(Boolean, default=False)
    created_at: Mapped[DateTime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Lazy-load relationship to avoid startup errors
    # marketing_packages: Mapped[list["MarketingPackage"]] = relationship(
    #     "MarketingPackage", 
    #     back_populates="user",
    #     lazy="select",  # Only load when explicitly accessed
    #     cascade="all, delete-orphan"
    # )
    
    def __repr__(self):
        return f"<User(email='{self.email}', username='{self.username}')>"
