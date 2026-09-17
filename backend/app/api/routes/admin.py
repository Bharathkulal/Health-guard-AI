"""
Admin Analytics API Endpoint for HealthGuard AI.

Protected endpoints for retrieving aggregated assessment data and model metrics.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.database.mongodb import get_collection, is_database_connected, COLLECTION_RISK_ASSESSMENTS
from src.prediction.predictor import predictor

router = APIRouter()

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Dependency to check if user has admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/stats", response_model=Dict[str, Any])
async def get_admin_stats(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns aggregated analytics on assessments."""
    stats = {
        "total_assessments": 0,
        "risk_distribution": {"Low": 0, "Moderate": 0, "High": 0},
    }
    
    if is_database_connected():
        collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
        if collection is not None:
            stats["total_assessments"] = await collection.count_documents({})
            for level in ["Low", "Moderate", "High"]:
                count = await collection.count_documents({"overall_risk": level})
                stats["risk_distribution"][level] = count
    
    return {"success": True, "data": stats}

@router.get("/models", response_model=Dict[str, Any])
async def get_model_metrics(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns metadata and metrics for the active ML models."""
    return {"success": True, "data": predictor.get_models_metadata()}
