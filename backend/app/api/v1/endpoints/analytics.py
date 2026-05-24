from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.marketing_package import MarketingPackage
from app.schemas.analytics import AnalyticsResponse, ActivityItem, TrendData
from app.core.security import get_current_user

router = APIRouter()


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
):
    """Get analytics data for the current user"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    if range == "7d":
        start_date = end_date - timedelta(days=7)
    elif range == "30d":
        start_date = end_date - timedelta(days=30)
    else:  # 90d
        start_date = end_date - timedelta(days=90)
    
    # Get package counts
    total_packages = db.query(MarketingPackage).filter(
        MarketingPackage.user_id == current_user.id,
        MarketingPackage.created_at >= start_date
    ).count()
    
    # Get SEO optimizations count (you might have a separate table for this)
    # For now, we'll estimate based on packages
    total_seo = total_packages  # Adjust based on your actual data model
    
    # Get thumbnail count (estimate 3 per package based on your logs)
    total_thumbnails = total_packages * 3
    
    # Calculate average SEO score (mock data - replace with actual calculation)
    avg_seo_score = 85  # You'd calculate this from your SEO results
    
    # Get recent activity
    recent_packages = db.query(MarketingPackage).filter(
        MarketingPackage.user_id == current_user.id
    ).order_by(MarketingPackage.created_at.desc()).limit(10).all()
    
    recent_activity = [
        ActivityItem(
            id=str(pkg.id),
            type="growth",
            topic=pkg.topic,
            timestamp=pkg.created_at.isoformat(),
            status="completed"
        )
        for pkg in recent_packages
    ]
    
    # Generate trend data (mock - replace with actual aggregation)
    package_trend = []
    current = start_date
    while current <= end_date:
        count = db.query(MarketingPackage).filter(
            MarketingPackage.user_id == current_user.id,
            MarketingPackage.created_at >= current,
            MarketingPackage.created_at < current + timedelta(days=1)
        ).count()
        package_trend.append(TrendData(
            date=current.strftime("%Y-%m-%d"),
            packages=count
        ))
        current += timedelta(days=1)
    
    # Thumbnail type distribution (mock)
    thumbnail_types = [
        {"name": "Cartoon", "value": 40, "color": "#0088FE"},
        {"name": "Minimalist", "value": 30, "color": "#00C49F"},
        {"name": "Bold Text", "value": 20, "color": "#FFBB28"},
        {"name": "Photo-Based", "value": 10, "color": "#FF8042"},
    ]
    
    return AnalyticsResponse(
        totalPackages=total_packages,
        totalThumbnails=total_thumbnails,
        totalSeoOptimizations=total_seo,
        avgSeoScore=avg_seo_score,
        recentActivity=recent_activity,
        packageTrend=package_trend,
        thumbnailTypes=thumbnail_types,
    )