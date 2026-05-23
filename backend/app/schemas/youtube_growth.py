"""
Pydantic schemas for YouTube Growth Agent
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


# === Request Schemas ===
class MarketingPackageRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200, description="Video topic/title")
    key_points: Optional[List[str]] = Field(None, description="Key points to cover in video")
    video_length: str = Field(default="8-12 minutes", description="Expected video duration")
    
    @validator('topic')
    def topic_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Topic cannot be empty")
        return v.strip()


# === Response Schemas ===
class SEOTitle(BaseModel):
    title: str
    score: int = Field(..., ge=1, le=10)
    reason: str

class ThumbnailConcept(BaseModel):
    title: str
    visual_description: str
    text_overlay: str = Field(..., max_length=50)
    color_palette: List[str] = Field(default_factory=lambda: ["#6366f1", "#8b5cf6", "#ec4899"])

class ScriptPoint(BaseModel):
    timestamp: str
    content: str

class ScriptOutline(BaseModel):
    hook: str
    main_points: List[ScriptPoint]
    cta: str

class UploadStrategy(BaseModel):
    best_time_ist: str
    playlist: str
    community_post: str

class SEOData(BaseModel):
    titles: List[SEOTitle]
    description: str
    tags: List[str]
    hashtags: List[str]

class SocialPosts(BaseModel):
    facebook: str
    instagram: str
    twitter: str
    linkedin: str

class MarketingPackageData(BaseModel):
    seo: SEOData
    thumbnails: List[ThumbnailConcept]
    social_posts: SocialPosts
    hooks: List[str]
    script_outline: ScriptOutline
    upload_strategy: UploadStrategy
    growth_tips: List[str]
    follow_up_ideas: List[str]

class MarketingPackageResponse(BaseModel):
    success: bool
    topic: str
    channel: Optional[str] = None
    data: Optional[MarketingPackageData] = None
    error: Optional[str] = None
    fallback_suggestions: Optional[Dict[str, Any]] = None
    generated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# === Database Schemas ===
class MarketingPackageCreate(BaseModel):
    user_id: int
    topic: str
    seo_data: Dict[str, Any]
    thumbnail_data: List[Dict[str, Any]]
    social_data: Dict[str, str]
    hooks: List[str]
    script_data: Dict[str, Any]
    strategy_data: Dict[str, str]
    growth_tips: List[str]
    follow_up_ideas: List[str]

class MarketingPackageInDB(BaseModel):
    id: int
    user_id: int
    topic: str
    seo_data: Dict[str, Any]
    thumbnail_data: List[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True
