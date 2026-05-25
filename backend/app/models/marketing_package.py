from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class MarketingPackage(Base):
    __tablename__ = "marketing_packages"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    topic = Column(String, nullable=False)
    target_audience = Column(String)
    key_points = Column(Text)

    seo_data = Column(Text)
    thumbnail_concepts = Column(Text)
    social_posts = Column(Text)
    script_outline = Column(Text)
    upload_strategy = Column(Text)
    growth_tips = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # FIXED RELATIONSHIP
    user = relationship("User")