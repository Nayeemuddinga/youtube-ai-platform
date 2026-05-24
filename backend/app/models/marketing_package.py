"""
MarketingPackage Model - SQLAlchemy ORM
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class MarketingPackage(Base):
    __tablename__ = "marketing_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Content fields
    topic = Column(String, nullable=False)
    target_audience = Column(String)
    key_points = Column(Text)  # JSON string
    seo_data = Column(Text)  # JSON string
    thumbnail_concepts = Column(Text)  # JSON string
    social_posts = Column(Text)  # JSON string
    script_outline = Column(Text)  # JSON string
    upload_strategy = Column(Text)  # JSON string
    growth_tips = Column(Text)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship back to User
    user = relationship("User", back_populates="marketing_packages")
    
    def __repr__(self):
        return f"<MarketingPackage(id={self.id}, topic='{self.topic}')>"
