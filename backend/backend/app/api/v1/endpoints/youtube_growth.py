"""
YouTube Growth API Endpoints
Protected routes for generating marketing packages
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.v1.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.youtube_growth import (
    MarketingPackageRequest,
    MarketingPackageResponse,
    MarketingPackageCreate,
    MarketingPackageInDB
)
from app.agents.youtube_growth_agent import youtube_growth_agent
from app.services.cache_service import cache_service
from app.db.crud import create_marketing_package, get_user_packages
import logging

router = APIRouter(prefix="/youtube/growth", tags=["youtube-growth"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=MarketingPackageResponse)
async def generate_marketing_package(
    request: MarketingPackageRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate complete YouTube marketing package for a video.
    
    This orchestrates SEO, thumbnails, social posts, hooks, scripts, and strategy.
    """
    logger.info(f"🚀 Growth package request from user {current_user.id}: {request.topic}")
    
    # Check cache first (user + topic combination)
    cache_key = f"growth:{current_user.id}:{request.topic}"
    cached = await cache_service.get("growth", {"key": cache_key})
    
    if cached:
        logger.info(f"✅ Cache HIT for growth package")
        return MarketingPackageResponse(**cached)
    
    # Generate with agent
    try:
        result = await youtube_growth_agent.generate_full_marketing_package(
            video_topic=request.topic,
            key_points=request.key_points,
            video_length=request.video_length
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Agent failed: {result.get('error', 'Unknown error')}"
            )
        
        # Save to database (async background task)
        background_tasks.add_task(
            _save_to_database,
            user_id=current_user.id,
            topic=request.topic,
            data=result["data"],
            db=db
        )
        
        # Cache result (1 hour TTL)
        background_tasks.add_task(
            cache_service.set,
            "growth",
            {"key": cache_key},
            result,
            ttl=3600
        )
        
        return MarketingPackageResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ Growth package generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate marketing package: {str(e)}"
        )


async def _save_to_database(
    user_id: int,
    topic: str,
    data: dict,
    db: Session
):
    """Background task: Save generated package to database"""
    try:
        create_marketing_package(
            db=db,
            user_id=user_id,
            topic=topic,
            seo_data=data.get("seo", {}),
            thumbnail_data=data.get("thumbnails", []),
            social_data=data.get("social_posts", {}),
            hooks=data.get("hooks", []),
            script_data=data.get("script_outline", {}),
            strategy_data=data.get("upload_strategy", {}),
            growth_tips=data.get("growth_tips", []),
            follow_up_ideas=data.get("follow_up_ideas", [])
        )
        logger.info(f"💾 Saved growth package to DB for user {user_id}")
    except Exception as e:
        logger.error(f"❌ Failed to save to DB: {e}")


@router.get("/history", response_model=List[MarketingPackageInDB])
async def get_growth_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's previously generated marketing packages"""
    return get_user_packages(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/stats")
async def get_growth_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage statistics for the growth agent"""
    packages = get_user_packages(db, user_id=current_user.id, limit=1000)
    
    return {
        "total_generations": len(packages),
        "unique_topics": len(set(p.topic for p in packages)),
        "recent_topics": [p.topic for p in packages[-10:]],
        "most_used_hashtags": _extract_top_hashtags(packages)
    }


def _extract_top_hashtags(packages: list) -> List[str]:
    """Helper: Extract most common hashtags from history"""
    from collections import Counter
    all_hashtags = []
    for p in packages:
        if p.seo_data and isinstance(p.seo_data, dict):
            hashtags = p.seo_data.get("hashtags", [])
            if isinstance(hashtags, list):
                all_hashtags.extend(hashtags)
    
    return [tag for tag, _ in Counter(all_hashtags).most_common(10)]
