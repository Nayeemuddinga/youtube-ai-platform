from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from openai import AsyncOpenAI
from app.config import get_settings
from app.schemas import SEOInput, SEOOutput
from app.api.v1.deps import get_current_user, get_db
from app.models.user import User
from app.services.cache_service import cache_service
import logging

router = APIRouter(prefix="/seo", tags=["seo-agent"])
logger = logging.getLogger(__name__)
settings = get_settings()
client = AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")

@router.post("/optimize", response_model=SEOOutput)
async def optimize_video_seo(seo_input: SEOInput, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"SEO request from user {current_user.id}: {seo_input.topic}")
    cache_data = {"user_id": current_user.id, "input": seo_input.model_dump()}
    cached_result = await cache_service.get("seo", cache_data)
    if cached_result:
        return SEOOutput(**cached_result)
    system_prompt = """You are a YouTube SEO expert. Return ONLY valid JSON matching this exact structure: {"titles": [{"title": "string (max 60 chars)", "score": 1-10, "reason": "string"}], "description": "string", "tags": ["string"], "hashtags": ["#string"]}. Do not include markdown or explanations."""
    user_prompt = f"Topic: {seo_input.topic}\nAudience: {seo_input.target_audience}\nKey points: {', '.join(seo_input.key_points or [])}"
    try:
        response = await client.chat.completions.create(model=settings.GROQ_MODEL, messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}], temperature=0.3, response_format={"type": "json_object"})
        result = SEOOutput.model_validate_json(response.choices[0].message.content.strip())
        background_tasks.add_task(cache_service.set, "seo", cache_data, result.model_dump(), ttl=settings.CACHE_TTL_SECONDS)
        return result
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(status_code=500, detail="AI optimization failed")
