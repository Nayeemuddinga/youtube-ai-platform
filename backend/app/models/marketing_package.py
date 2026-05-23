from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class MarketingPackage(Base):
    __tablename__ = "marketing_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    
    # Stored as JSON for flexibility
    seo_data = Column(JSON)
    thumbnail_data = Column(JSON)
    social_data = Column(JSON)
    hooks = Column(JSON)
    script_data = Column(JSON)
    strategy_data = Column(JSON)
    growth_tips = Column(JSON)
    follow_up_ideas = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="marketing_packages")
