# backend/app/api/v1/endpoints/seo.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.seo import SEOInput, SEOOutput
# Assuming you have an agent file, adjust the import if necessary
from app.agents.seo_agent import generate_seo_data 

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/optimize", response_model=SEOOutput)
async def optimize_seo(
    input: SEOInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate SEO optimization for a video topic using AI.
    """
    logger.info(f"SEO Request from user {current_user.id}: {input.topic}")
    try:
        # Call your AI agent to generate SEO data
        # Make sure your agent function returns a dict compatible with SEOOutput
        result = await generate_seo_data(
            topic=input.topic,
            audience=input.target_audience,
            key_points=input.key_points
        )
        return result
    except Exception as e:
        logger.error(f"Error generating SEO: {e}")
        raise HTTPException(status_code=500, detail=str(e))