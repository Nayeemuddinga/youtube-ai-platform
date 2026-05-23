"""
Thumbnail Image Generation API Endpoints
Protected routes for generating actual thumbnail images from concepts
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.api.v1.deps import get_current_user, get_db
from app.models.user import User
from app.services.image_service import generate_multiple_thumbnails
from app.services.cache_service import cache_service

router = APIRouter(prefix="/thumbnails", tags=["thumbnails"])
logger = logging.getLogger(__name__)


@router.post("/generate")
async def generate_thumbnail_images(
    request: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate actual thumbnail images from text concepts.
    
    Request body:
    {
      "concepts": [
        {"title": "Concept 1", "visual_description": "...", "text_overlay": "..."},
        ...
      ],
      "base_seed": 42  // optional, for reproducibility
    }
    
    Response:
    {
      "success": true,
      "images": [
        {"title": "...", "visual_description": "...", "image_url": "https://...", "generation_status": "success"},
        ...
      ]
    }
    """
    concepts = request.get("concepts", [])
    base_seed = request.get("base_seed", 42)
    
    if not concepts:
        raise HTTPException(status_code=400, detail="At least one concept is required")
    
    logger.info(f"🎨 Generating {len(concepts)} thumbnail images for user {current_user.id}")
    
    # Check cache first
    import hashlib
    cache_key = f"thumbs:{current_user.id}:{hashlib.md5(str(concepts).encode()).hexdigest()[:12]}"
    cached = await cache_service.get("thumbnails", {"key": cache_key})
    
    if cached:
        logger.info(f"✅ Cache HIT for thumbnail images")
        return cached
    
    # Generate images
    try:
        images = await generate_multiple_thumbnails(concepts, base_seed)
        
        result = {
            "success": True,
            "images": images,
            "provider": "pollinations",  # or "stability" in production
            "note": "Images are generated on-demand. For production, consider pre-generating and storing in S3/Cloudinary."
        }
        
        # Cache result (30 minutes - images don't change often)
        background_tasks.add_task(
            cache_service.set,
            "thumbnails",
            {"key": cache_key},
            result,
            ttl=1800
        )
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Thumbnail generation failed: {e}")
        # Return fallback placeholders
        fallback_images = []
        for i, concept in enumerate(concepts):
            fallback_images.append({
                **concept,
                "image_url": f"https://via.placeholder.com/1280x720/8b5cf6/ffffff?text={concept.get('title', 'Thumbnail')}",
                "generation_status": "fallback"
            })
        
        return {
            "success": True,
            "images": fallback_images,
            "provider": "fallback",
            "warning": "Image generation failed, using placeholders"
        }


@router.get("/providers")
async def get_image_providers():
    """Get available image generation providers"""
    return {
        "available": [
            {
                "id": "pollinations",
                "name": "Pollinations.ai",
                "description": "Free, no API key, good for development",
                "cost": "free",
                "quality": "good"
            },
            {
                "id": "stability",
                "name": "Stability AI (SD3)",
                "description": "High quality, requires API key, production-ready",
                "cost": "paid",
                "quality": "excellent"
            }
        ],
        "default": "pollinations"
    }
