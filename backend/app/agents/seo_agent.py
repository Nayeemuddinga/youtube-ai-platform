# backend/app/agents/seo_agent.py
import os
import json
import logging
from groq import Groq
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize Groq Client
client = Groq(api_key=settings.GROQ_API_KEY)

def generate_seo_data(topic: str, audience: str):
    """
    Generates SEO optimized titles, description, and tags for a video.
    """
    logger.info(f"Generating SEO data for: {topic}")
    
    prompt = f"""
    You are an expert YouTube SEO consultant for a channel called "LearningWithAhad Studio".
    The channel focuses on AI education for kids and beginners.
    
    Topic: {topic}
    Target Audience: {audience}
    
    Please generate:
    1. 5 High-CTR Video Titles (catchy, under 60 chars).
    2. A SEO-optimized Video Description (3 paragraphs, including keywords).
    3. 15 Relevant Tags (comma separated).
    
    Return the response in JSON format only with keys: "titles", "description", "tags".
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        
        response_content = chat_completion.choices[0].message.content
        
        # Try to parse JSON from the response
        # The AI might wrap it in markdown, so we clean it up
        cleaned_content = response_content.replace("```json", "").replace("```", "").strip()
        
        try:
            seo_data = json.loads(cleaned_content)
            return seo_data
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON from AI response")
            return {
                "error": "Failed to parse AI response",
                "raw": response_content
            }

    except Exception as e:
        logger.error(f"Error generating SEO data: {e}")
        return {"error": str(e)}