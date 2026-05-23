"""
Image Generation Service - Inline SVG (No External Dependencies)
Generates SVG data URIs that work offline
"""
import logging
import urllib.parse
from typing import Optional, List
import base64

logger = logging.getLogger(__name__)


def generate_svg_thumbnail(
    title: str,
    text_overlay: str,
    colors: List[str],
    width: int = 1280,
    height: int = 720
) -> str:
    """
    Generate an inline SVG thumbnail as a data URI.
    No external requests - works 100% offline!
    """
    # Use first color or default to purple
    bg_color = colors[0] if colors and len(colors) > 0 else "#8b5cf6"
    
    # Escape text for SVG
    safe_title = title.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    safe_overlay = text_overlay.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # Create SVG with gradient background
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <!-- Background Gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{bg_color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{colors[1] if len(colors) > 1 else '#6366f1'};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Decorative Circles -->
  <circle cx="{width * 0.1}" cy="{height * 0.1}" r="100" fill="white" opacity="0.1"/>
  <circle cx="{width * 0.9}" cy="{height * 0.9}" r="150" fill="white" opacity="0.1"/>
  <circle cx="{width * 0.8}" cy="{height * 0.2}" r="80" fill="white" opacity="0.15"/>
  
  <!-- Main Title -->
  <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="Arial, sans-serif">
    {safe_title}
  </text>
  
  <!-- Text Overlay Box -->
  <rect x="{width * 0.1}" y="{height * 0.6}" width="{width * 0.8}" height="{height * 0.25}" 
        fill="white" opacity="0.9" rx="20" ry="20"/>
  
  <!-- Text Overlay -->
  <text x="50%" y="73%" text-anchor="middle" fill="{bg_color}" font-size="48" font-weight="bold" font-family="Arial, sans-serif">
    {safe_overlay}
  </text>
  
  <!-- Bottom Accent -->
  <rect x="0" y="{height - 10}" width="{width}" height="10" fill="white" opacity="0.3"/>
</svg>'''
    
    # Convert to data URI
    svg_bytes = svg_content.encode('utf-8')
    base64_svg = base64.b64encode(svg_bytes).decode('utf-8')
    data_uri = f"data:image/svg+xml;base64,{base64_svg}"
    
    logger.info(f"🎨 Generated SVG thumbnail: {title}")
    return data_uri


async def generate_thumbnail_image(
    prompt: str,
    width: int = 1280,
    height: int = 720,
    seed: Optional[int] = None,
    provider: str = "svg"
) -> str:
    """Generate a thumbnail - now uses inline SVG."""
    # This function is kept for API compatibility
    # But we'll generate SVGs in generate_multiple_thumbnails instead
    return f"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}'%3E%3Crect fill='%238b5cf6' width='100%25' height='100%25'/%3E%3C/svg%3E"


async def generate_multiple_thumbnails(
    concepts: List[dict],
    base_seed: int = 42
) -> List[dict]:
    """Generate SVG thumbnails for concepts (100% offline)."""
    results = []
    
    for i, concept in enumerate(concepts):
        title = concept.get("title", "Thumbnail")
        text_overlay = concept.get("text_overlay", "Click to Watch")
        color_palette = concept.get("color_palette", ["#8b5cf6", "#6366f1"])
        
        # Generate inline SVG
        image_url = generate_svg_thumbnail(
            title=title,
            text_overlay=text_overlay,
            colors=color_palette
        )
        
        result = concept.copy()
        result["image_url"] = image_url
        result["generation_status"] = "success"
        result["provider"] = "inline_svg"
        results.append(result)
    
    return results
