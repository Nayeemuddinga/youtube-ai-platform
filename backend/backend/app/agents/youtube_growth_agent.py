"""
YouTube Growth Agent for LearningWithAhad
Orchestrates SEO, thumbnails, social posts, hooks, scripts, and analytics.
"""
import logging
from typing import Dict, List, Optional
from app.services.ai_service import generate_structured_json, generate_with_retry
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class YouTubeGrowthAgent:
    """Main agent for LearningWithAhad channel growth"""
    
    def __init__(self, channel_name: str = None, target_audience: str = None):
        self.channel_name = channel_name or settings.CHANNEL_NAME
        self.target_audience = target_audience or settings.TARGET_AUDIENCE
    
    async def generate_full_marketing_package(
        self,
        video_topic: str,
        key_points: Optional[List[str]] = None,
        video_length: str = "8-12 minutes"
    ) -> Dict:
        """
        Generate complete marketing package for a video.
        
        Returns structured data for:
        - SEO (titles, description, tags, hashtags)
        - Thumbnails (3 concepts with visuals + text)
        - Social posts (Facebook, Instagram, X, LinkedIn)
        - Hook ideas for Shorts/Reels
        - Script outline
        - Upload strategy
        """
        logger.info(f"🎬 Generating marketing package for: {video_topic}")
        
        # Build comprehensive prompt
        points_text = "\n".join([f"- {p}" for p in (key_points or [])])
        
        prompt = f"""
You are the YouTube Growth Expert for {self.channel_name} channel.

VIDEO DETAILS:
- Topic: {video_topic}
- Target Audience: {self.target_audience}
- Video Length: {video_length}
- Key Points:
{points_text if points_text else "- (Creator will provide during filming)"}

Generate a COMPLETE marketing package with these EXACT sections:

1. SEO OPTIMIZATION:
   - 10 high-CTR titles (under 60 chars, include primary keyword early)
   - SEO-optimized description (2-3 paragraphs, natural keyword usage)
   - 20 relevant tags (mix of broad + specific)
   - 15 hashtags (trending + niche)

2. THUMBNAIL CONCEPTS (3 ideas):
   For each: title, visual_description, text_overlay (max 4 words), color_palette

3. SOCIAL MEDIA POSTS:
   - Facebook: Engaging post with emoji + link placeholder
   - Instagram: Caption with line breaks + hashtags
   - X/Twitter: Punchy thread starter (under 280 chars)
   - LinkedIn: Professional insight + value proposition

4. HOOK IDEAS (for Shorts/Reels):
   - 5 viral opening lines (first 3 seconds)
   - Visual hook suggestions

5. SCRIPT OUTLINE:
   - Hook (0-15s): Attention-grabbing opener
   - Main Points: 3-5 key segments with timestamps
   - CTA: Strong call-to-action for end

6. UPLOAD STRATEGY:
   - Best day/time to publish (IST timezone)
   - Suggested playlist placement
   - Community post idea for pre-launch

7. GROWTH TIPS:
   - 3 specific suggestions to improve CTR/watch time
   - Follow-up video ideas

FORMAT: Return ONLY valid JSON with this exact structure:
{{
  "seo": {{
    "titles": [{{"title": "str", "score": 1-10, "reason": "str"}}],
    "description": "str",
    "tags": ["str"],
    "hashtags": ["str"]
  }},
  "thumbnails": [{{"title": "str", "visual_description": "str", "text_overlay": "str", "color_palette": ["str"]}}],
  "social_posts": {{
    "facebook": "str",
    "instagram": "str", 
    "twitter": "str",
    "linkedin": "str"
  }},
  "hooks": ["str"],
  "script_outline": {{
    "hook": "str",
    "main_points": [{{"timestamp": "str", "content": "str"}}],
    "cta": "str"
  }},
  "upload_strategy": {{
    "best_time_ist": "str",
    "playlist": "str",
    "community_post": "str"
  }},
  "growth_tips": ["str"],
  "follow_up_ideas": ["str"]
}}

RULES:
- Return ONLY JSON, no markdown, no explanations
- All fields must be present
- Optimize for CTR, watch time, and subscriber growth
- Keep educational tone aligned with {self.channel_name} brand
"""
        
        try:
            result = await generate_structured_json(
                prompt=prompt,
                schema_description="Full marketing package JSON as described above",
                model=settings.GROQ_MODEL
            )
            
            logger.info("✅ Marketing package generated successfully")
            return {
                "success": True,
                "topic": video_topic,
                "channel": self.channel_name,
                "data": result,
                "generated_at": None  # Will be set by API layer
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to generate marketing package: {e}")
            return {
                "success": False,
                "error": str(e),
                "topic": video_topic,
                "fallback_suggestions": self._get_fallback_suggestions(video_topic)
            }
    
    def _get_fallback_suggestions(self, topic: str) -> Dict:
        """Return safe fallback if AI fails"""
        return {
            "seo": {
                "titles": [{"title": f"{topic} - Complete Guide", "score": 7, "reason": "Clear and descriptive"}],
                "description": f"Learn about {topic} in this comprehensive tutorial from {self.channel_name}.",
                "tags": [topic.lower().replace(" ", "-"), "tutorial", "guide", "education"],
                "hashtags": [f"#{topic.replace(' ', '')}", "#LearningWithAhad", "#Education"]
            },
            "thumbnails": [{"title": "Simple Concept", "visual_description": "Clean text on gradient background", "text_overlay": topic[:20], "color_palette": ["#6366f1", "#8b5cf6"]}],
            "social_posts": {
                "facebook": f"New video: {topic} 🎬 Watch now!",
                "instagram": f"{topic}\n\nLink in bio 👆\n\n#LearningWithAhad",
                "twitter": f"Just dropped: {topic}\n\nWatch → [link]",
                "linkedin": f"New educational content: {topic}. Great for {self.target_audience.lower()}."
            },
            "hooks": [f"Did you know {topic.lower()} could change how you learn?"],
            "script_outline": {
                "hook": "Start with a surprising fact about the topic",
                "main_points": [{"timestamp": "0:30", "content": "Introduction"}, {"timestamp": "2:00", "content": "Key concepts"}, {"timestamp": "6:00", "content": "Practical examples"}],
                "cta": "Subscribe for more educational content!"
            },
            "upload_strategy": {
                "best_time_ist": "Tuesday or Thursday, 7-9 PM IST",
                "playlist": "Educational Tutorials",
                "community_post": "Poll: What should we cover next?"
            },
            "growth_tips": ["Add chapters for better retention", "Use end screens to promote related videos", "Engage with first 10 comments"],
            "follow_up_ideas": [f"Advanced {topic}", f"{topic} Common Mistakes", f"{topic} Tools & Resources"]
        }


# Singleton instance for easy import
youtube_growth_agent = YouTubeGrowthAgent()
