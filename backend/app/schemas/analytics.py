from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ActivityItem(BaseModel):
    id: str
    type: str  # 'seo', 'growth', 'thumbnail'
    topic: str
    timestamp: str
    status: str  # 'completed', 'processing', 'failed'
    
    class Config:
        from_attributes = True


class TrendData(BaseModel):
    date: str
    packages: int
    
    class Config:
        from_attributes = True


class ThumbnailType(BaseModel):
    name: str
    value: int
    color: str


class AnalyticsResponse(BaseModel):
    totalPackages: int
    totalThumbnails: int
    totalSeoOptimizations: int
    avgSeoScore: float
    recentActivity: List[ActivityItem]
    packageTrend: List[TrendData]
    thumbnailTypes: List[ThumbnailType]
    
    class Config:
        from_attributes = True