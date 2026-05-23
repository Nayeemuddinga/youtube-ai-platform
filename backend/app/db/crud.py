from sqlalchemy.orm import Session
from app.models.marketing_package import MarketingPackage
from app.schemas.youtube_growth import MarketingPackageCreate
from typing import List, Optional

def create_marketing_package(
    db: Session,
    user_id: int,
    topic: str,
    seo_data: dict,
    thumbnail_data: list,
    social_data: dict,
    hooks: list,
    script_data: dict,
    strategy_data: dict,
    growth_tips: list,
    follow_up_ideas: list
) -> MarketingPackage:
    """Create new marketing package in database"""
    db_package = MarketingPackage(
        user_id=user_id,
        topic=topic,
        seo_data=seo_data,
        thumbnail_data=thumbnail_data,
        social_data=social_data,
        hooks=hooks,
        script_data=script_data,
        strategy_data=strategy_data,
        growth_tips=growth_tips,
        follow_up_ideas=follow_up_ideas
    )
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    return db_package

def get_user_packages(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20
) -> List[MarketingPackage]:
    """Get marketing packages for a user, ordered by newest first"""
    return db.query(MarketingPackage)\
        .filter(MarketingPackage.user_id == user_id)\
        .order_by(MarketingPackage.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_package_by_id(
    db: Session,
    package_id: int
) -> Optional[MarketingPackage]:
    """Get single package by ID"""
    return db.query(MarketingPackage).filter(MarketingPackage.id == package_id).first()
