from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class SEOInput(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)
    target_audience: str = Field(..., min_length=2, max_length=100)
    key_points: Optional[List[str]] = None

class SEOTitle(BaseModel):
    title: str
    score: int = Field(..., ge=1, le=10)
    reason: str


class Thumbnail(BaseModel):
    title: str
    visual_description: str
    text_overlay: str

class VideoOutline(BaseModel):
    hook: str
    main_points: List[str]
    cta: str

class SEOOutput(BaseModel):
    titles: List[SEOTitle]
    description: str
    tags: List[str]
    hashtags: List[str]
    thumbnails: List[Thumbnail] = []
    outline: VideoOutline = None
    thumbnails: List[Thumbnail] = []
    outline: VideoOutline = None

class UserBase(BaseModel):
    email: str
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    @validator('password')
    def password_strength(cls, v):
        if len(v) > 72:
            raise ValueError('Password cannot exceed 72 characters (bcrypt limit)')
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v) or not any(c.islower() for c in v):
            raise ValueError('Password must contain upper and lowercase letters')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain a number')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str
