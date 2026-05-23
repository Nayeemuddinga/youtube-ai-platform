"""
Centralized AI Service Layer
All agents call this service for Groq API interactions.
Handles: retries, rate limits, model config, error handling
"""
import asyncio
import logging
from typing import Optional, Dict, Any
from groq import AsyncGroq
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize Groq client (singleton pattern)
_groq_client: Optional[AsyncGroq] = None

def get_groq_client() -> AsyncGroq:
    """Get or create Groq client instance"""
    global _groq_client
    if _groq_client is None:
        _groq_client = AsyncGroq(
            api_key=settings.GROQ_API_KEY,
            timeout=30.0,  # 30 second timeout
            max_retries=3  # Built-in retry
        )
        logger.info("✅ Groq client initialized")
    return _groq_client

async def generate_with_retry(
    prompt: str,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
    response_format: Optional[Dict] = None,
    max_attempts: int = 3
) -> str:
    """
    Generate text with Groq, with exponential backoff retry logic.
    
    Args:
        prompt: The system+user prompt
        model: Groq model ID (defaults to settings.GROQ_MODEL)
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Max output tokens
        response_format: {"type": "json_object"} for structured output
        max_attempts: Number of retry attempts on failure
    
    Returns:
        Generated text content
    """
    client = get_groq_client()
    model_name = model or settings.GROQ_MODEL
    
    last_error = None
    
    for attempt in range(max_attempts):
        try:
            logger.info(f"🤖 Groq request (attempt {attempt+1}/{max_attempts}): {model_name}")
            
            # Build messages
            messages = [
                {"role": "system", "content": "You are a helpful YouTube marketing expert. Return ONLY the requested output, no extra text."},
                {"role": "user", "content": prompt}
            ]
            
            # Call Groq API
            response = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format if response_format else {"type": "text"}
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from Groq API")
            
            logger.info(f"✅ Groq response received ({len(content)} chars)")
            return content.strip()
            
        except Exception as e:
            last_error = e
            logger.warning(f"⚠️ Groq attempt {attempt+1} failed: {type(e).__name__}: {e}")
            
            if attempt < max_attempts - 1:
                # Exponential backoff: 1s, 2s, 4s
                wait_time = (2 ** attempt) + (asyncio.get_event_loop().time() % 1)
                logger.info(f"🔄 Retrying in {wait_time:.1f}s...")
                await asyncio.sleep(wait_time)
            else:
                logger.error(f"❌ Groq failed after {max_attempts} attempts: {e}")
                raise
    
    # Should never reach here, but just in case
    raise last_error or RuntimeError("Unknown error in generate_with_retry")

async def generate_structured_json(
    prompt: str,
    schema_description: str,
    model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate structured JSON output with validation.
    
    Args:
        prompt: User prompt describing what to generate
        schema_description: Description of expected JSON structure
        model: Optional model override
    
    Returns:
        Parsed JSON dictionary
    """
    import json
    
    full_prompt = f"""{prompt}

IMPORTANT: Return ONLY valid JSON matching this structure:
{schema_description}

Do not include markdown, code blocks, or explanations. Just the JSON."""

    response_text = await generate_with_retry(
        prompt=full_prompt,
        model=model,
        response_format={"type": "json_object"}
    )
    
    # Clean and parse JSON
    clean_json = response_text.strip()
    if clean_json.startswith("```json"):
        clean_json = clean_json[7:]
    if clean_json.startswith("```"):
        clean_json = clean_json[3:]
    if clean_json.endswith("```"):
        clean_json = clean_json[:-3]
    
    clean_json = clean_json.strip()
    
    try:
        return json.loads(clean_json)
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse JSON response: {e}")
        logger.debug(f"Response preview: {clean_json[:200]}...")
        raise ValueError(f"Invalid JSON from AI: {e}")
