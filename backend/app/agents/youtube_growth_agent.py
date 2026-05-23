import logging
from typing import Dict, List, Optional
from app.services.ai_service import generate_structured_json
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def generate_youtube_growth_package(
    topic: str,
    target_audience: str,
    key_points: Optional[List[str]] = None,
    video_length: str = "8-12 minutes"
) -> Dict:
    logger.info(f"Generating growth package for: {topic}")
    
    points_text = "\n".join([f"- {p}" for p in (key_points or [])])
    
    prompt = f"""
You are the YouTube Growth Expert for LearningWithAhad channel.

VIDEO DETAILS:
- Topic: {topic}
- Target Audience: {target_audience}
- Video Length: {video_length}
- Key Points:
{points_text if points_text else "- (Creator will provide during filming)"}

Generate a COMPLETE marketing package with these EXACT sections:

1. SEO OPTIMIZATION: 10 titles, description, tags, hashtags
2. THUMBNAIL CONCEPTS: 3 ideas with title, visual_description, text_overlay, color_palette
3. SOCIAL MEDIA POSTS: Facebook, Instagram, Twitter, LinkedIn
4. HOOK IDEAS: 5 viral opening lines
5. SCRIPT OUTLINE: Hook, main_points with timestamps, CTA
6. UPLOAD STRATEGY: best_time_ist, playlist, community_post
7. GROWTH TIPS: 3 suggestions + follow_up_ideas

Return ONLY valid JSON with this structure:
{{
  "seo": {{"titles": [{{"title": "str", "score": 1-10, "reason": "str"}}], "description": "str", "tags": ["str"], "hashtags": ["str"]}},
  "thumbnails": [{{"title": "str", "visual_description": "str", "text_overlay": "str", "color_palette": ["str"]}}],
  "social_posts": {{"facebook": "str", "instagram": "str", "twitter": "str", "linkedin": "str"}},
  "hooks": ["str"],
  "script_outline": {{"hook": "str", "main_points": [{{"timestamp": "str", "content": "str"}}], "cta": "str"}},
  "upload_strategy": {{"best_time_ist": "str", "playlist": "str", "community_post": "str"}},
  "growth_tips": ["str"],
  "follow_up_ideas": ["str"]
}}

Return ONLY JSON, no markdown. All fields required.
"""
    
    try:
        result = await generate_structured_json(
            prompt=prompt,
            schema_description="Full YouTube marketing package",
            model=settings.GROQ_MODEL
        )
        logger.info("Growth package generated successfully")
        return {"success": True, "topic": topic, "data": result}
    except Exception as e:
        logger.error(f"Failed: {e}")
        return {"success": False, "error": str(e), "topic": topic}
