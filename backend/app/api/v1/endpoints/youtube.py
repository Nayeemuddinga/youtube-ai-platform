from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api.v1.deps import get_current_user, get_db
from app.models.user import User
from app.agents.youtube_growth_agent import generate_youtube_growth_package
from app.services.cache_service import cache_service
import logging

router = APIRouter(prefix="/youtube/growth", tags=["youtube-growth"])
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_marketing_package(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = request.get("topic")
    target_audience = request.get("target_audience", "")
    key_points = request.get("key_points", [])
    video_length = request.get("video_length", "8-12 minutes")
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")
    
    logger.info(f"Growth package request: {topic}")
    
    cache_key = f"growth:{current_user.id}:{topic}"
    cached = await cache_service.get("growth", {"key": cache_key})
    
    if cached:
        return cached
    
    try:
        result = await generate_youtube_growth_package(
            topic=topic,
            target_audience=target_audience,
            key_points=key_points,
            video_length=video_length
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed"))
        
        background_tasks.add_task(
            cache_service.set,
            "growth",
            {"key": cache_key},
            result,
            ttl=3600
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_growth_stats(current_user: User = Depends(get_current_user)):
    return {"total_generations": 0, "message": "Coming soon"}
