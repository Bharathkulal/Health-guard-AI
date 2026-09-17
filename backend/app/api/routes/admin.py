"""
Admin Analytics API Endpoint for HealthGuard AI.

Protected endpoints for retrieving aggregated assessment data and model metrics.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.database.mongodb import get_collection, is_database_connected, COLLECTION_RISK_ASSESSMENTS, COLLECTION_USERS
from src.prediction.predictor import predictor
from datetime import datetime, timezone

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
        "total_users": 0,
        "risk_distribution": {"Low": 0, "Moderate": 0, "High": 0},
    }
    
    if is_database_connected():
        collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
        users_col = get_collection(COLLECTION_USERS)
        
        if users_col is not None:
            stats["total_users"] = await users_col.count_documents({})

        if collection is not None:
            stats["total_assessments"] = await collection.count_documents({})
            for level in ["Low", "Moderate", "High"]:
                count = await collection.count_documents({"overall_risk": level})
                stats["risk_distribution"][level] = count
    
    return {"success": True, "data": stats}

@router.get("/assessments", response_model=Dict[str, Any])
async def get_admin_assessments(limit: int = 50, current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns recent assessments."""
    assessments = []
    if is_database_connected():
        collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
        if collection is not None:
            cursor = collection.find({}).sort("created_at", -1).limit(limit)
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                # Mask sensitive info if necessary, but keep risk scores
                assessments.append(doc)
                
    return {"success": True, "data": assessments}

@router.get("/users", response_model=Dict[str, Any])
async def get_admin_users(limit: int = 50, current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns recent users."""
    users = []
    if is_database_connected():
        collection = get_collection(COLLECTION_USERS)
        if collection is not None:
            cursor = collection.find({}).sort("created_at", -1).limit(limit)
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                # Mask password
                doc.pop("hashed_password", None)
                users.append(doc)
                
    return {"success": True, "data": users}

@router.get("/models", response_model=Dict[str, Any])
@router.get("/model-info", response_model=Dict[str, Any])
async def get_model_metrics(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns metadata and metrics for the active ML models."""
    return {"success": True, "data": predictor.get_models_metadata()}
