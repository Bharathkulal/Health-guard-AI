"""
Admin Administration & ML Control API Endpoints for HealthGuard AI.
Protected endpoints for dataset ingestion, validation, model training,
versioning, active inference routing, clinical analytics, and system diagnostics.
"""

import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.services.dataset_service import dataset_service
from app.services.admin_analytics_service import admin_analytics_service

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "ml"))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.training.model_registry import model_registry
from src.training.custom_trainer import train_custom_model

router = APIRouter()


def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Dependency enforcing admin role."""
    if current_user.get("role") != "admin" and current_user.get("name") != "System Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )
    return current_user


# ==========================================
# 1. OVERVIEW & ANALYTICS
# ==========================================

@router.get("/stats", response_model=Dict[str, Any])
async def get_admin_stats(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns aggregated overview KPIs for dashboard."""
    stats = await admin_analytics_service.get_overview_stats()
    return {"success": True, "data": stats}


@router.get("/analytics", response_model=Dict[str, Any])
async def get_assessment_analytics(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns longitudinal assessment trends and time-series distributions."""
    analytics = await admin_analytics_service.get_assessment_analytics()
    return {"success": True, "data": analytics}


@router.get("/analytics/risk-distribution", response_model=Dict[str, Any])
async def get_risk_distribution(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns condition-specific risk distribution breakdowns."""
    dist = await admin_analytics_service.get_risk_distribution()
    return {"success": True, "data": dist}


@router.get("/analytics/user-statistics", response_model=Dict[str, Any])
async def get_user_statistics(current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns user population and engagement metrics."""
    user_stats = await admin_analytics_service.get_user_statistics()
    return {"success": True, "data": user_stats}


# ==========================================
# 2. DATASET MANAGEMENT
# ==========================================

@router.get("/datasets", response_model=Dict[str, Any])
async def list_datasets(current_user: Dict[str, Any] = Depends(require_admin)):
    """Lists all uploaded and benchmark datasets."""
    datasets = dataset_service.list_datasets()
    return {"success": True, "data": datasets}


@router.post("/datasets/upload", response_model=Dict[str, Any])
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    target_column: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Uploads a CSV or XLSX dataset and computes full real statistics & preview."""
    try:
        content = await file.read()
        metadata = dataset_service.upload_dataset(
            file_bytes=content,
            filename=file.filename or "dataset.csv",
            display_name=name,
            target_column=target_column,
        )
        return {"success": True, "data": metadata, "message": "Dataset uploaded and analyzed successfully."}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset upload failed: {str(exc)}"
        )


@router.get("/datasets/{dataset_id}", response_model=Dict[str, Any])
async def get_dataset_details(dataset_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Retrieves dataset schema, stats, and preview records."""
    ds = dataset_service.get_dataset(dataset_id)
    if not ds:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")
    return {"success": True, "data": ds}


class ValidateDatasetRequest(BaseModel):
    target_column: Optional[str] = None


@router.post("/datasets/{dataset_id}/validate", response_model=Dict[str, Any])
async def validate_dataset(
    dataset_id: str,
    body: Optional[ValidateDatasetRequest] = None,
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Executes deep validation suite on specified dataset."""
    try:
        target_col = body.target_column if body else None
        report = dataset_service.validate_dataset(dataset_id, target_column=target_col)
        return {"success": True, "data": report}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset validation error: {str(exc)}"
        )


@router.delete("/datasets/{dataset_id}", response_model=Dict[str, Any])
async def delete_dataset(dataset_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Removes a dataset from catalog and disk."""
    success = dataset_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")
    return {"success": True, "message": "Dataset deleted successfully."}


# ==========================================
# 3. ML MODEL TRAINING & MANAGEMENT
# ==========================================

class TrainModelRequest(BaseModel):
    dataset_id: str
    target_column: str
    prediction_type: str = "heart"  # heart, diabetes, hypertension, general
    algorithm: str = "RandomForest"  # LogisticRegression, RandomForest, DecisionTree, GradientBoosting
    test_size: float = 0.2
    model_name: Optional[str] = None
    version: Optional[str] = None
    auto_activate: bool = False


@router.post("/models/train", response_model=Dict[str, Any])
async def train_model(
    req: TrainModelRequest,
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Executes genuine Scikit-Learn training pipeline on the selected dataset."""
    ds = dataset_service.get_dataset(req.dataset_id)
    if not ds:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified dataset not found.")

    file_path = ds.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset file missing on disk.")

    try:
        result = train_custom_model(
            dataset_path=file_path,
            target_column=req.target_column,
            prediction_type=req.prediction_type,
            algorithm=req.algorithm,
            test_size=req.test_size,
            model_name=req.model_name,
            dataset_name=ds.get("name"),
            dataset_id=req.dataset_id,
            version=req.version,
            auto_activate=req.auto_activate,
        )
        return {
            "success": True,
            "data": result,
            "message": f"Successfully trained {req.algorithm} model (v{result.get('version')}) with {result.get('accuracy') * 100:.1f}% accuracy.",
        }
    except Exception as exc:
        logger.error(f"Model training error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model training failed: {str(exc)}"
        )


@router.get("/models", response_model=Dict[str, Any])
@router.get("/model-info", response_model=Dict[str, Any])
async def list_models(current_user: Dict[str, Any] = Depends(require_admin)):
    """Lists all registered models and active versions."""
    models = model_registry.get_all_models()
    return {"success": True, "data": models}


@router.get("/models/{model_id}", response_model=Dict[str, Any])
async def get_model_details(model_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Retrieves full evaluation metrics, confusion matrix, and feature importances."""
    model = model_registry.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model version not found.")
    return {"success": True, "data": model}


@router.post("/models/{model_id}/activate", response_model=Dict[str, Any])
async def activate_model(model_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Sets a model version as active for live patient predictions."""
    success = model_registry.set_active_model(model_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model could not be activated.")
    return {"success": True, "message": "Model activated successfully for live inference."}


@router.post("/models/{model_id}/deactivate", response_model=Dict[str, Any])
async def deactivate_model(model_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Deactivates a model version and restores default baseline."""
    success = model_registry.deactivate_model(model_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model could not be deactivated.")
    return {"success": True, "message": "Model deactivated. Restored default baseline model."}


@router.delete("/models/{model_id}", response_model=Dict[str, Any])
async def delete_model(model_id: str, current_user: Dict[str, Any] = Depends(require_admin)):
    """Deletes a custom model version from catalog."""
    success = model_registry.delete_model(model_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found or cannot be deleted.")
    return {"success": True, "message": "Model version removed from catalog."}


# ==========================================
# 4. USERS & ASSESSMENT HISTORY
# ==========================================

@router.get("/users", response_model=Dict[str, Any])
async def get_all_users(limit: int = 100, current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns registered users with longitudinal assessment volume."""
    users = await admin_analytics_service.get_all_users(limit=limit)
    return {"success": True, "data": users}


@router.get("/assessments", response_model=Dict[str, Any])
async def get_all_assessments(limit: int = 100, current_user: Dict[str, Any] = Depends(require_admin)):
    """Returns historical patient assessments."""
    assessments = await admin_analytics_service.get_all_assessments(limit=limit)
    return {"success": True, "data": assessments}


# ==========================================
# 5. SYSTEM HEALTH & SETTINGS
# ==========================================

@router.get("/system/health", response_model=Dict[str, Any])
async def get_system_health(current_user: Dict[str, Any] = Depends(require_admin)):
    """Runs real diagnostics on API, database, ML engines, and storage."""
    health_data = await admin_analytics_service.get_system_health()
    return {"success": True, "data": health_data}


@router.get("/settings", response_model=Dict[str, Any])
async def get_admin_settings(current_user: Dict[str, Any] = Depends(require_admin)):
    """Retrieves system administration preferences."""
    settings_data = admin_analytics_service.get_settings()
    return {"success": True, "data": settings_data}


class UpdateSettingsRequest(BaseModel):
    auto_activate_models: Optional[bool] = None
    default_training_algorithm: Optional[str] = None
    default_test_split: Optional[float] = None
    session_timeout_minutes: Optional[int] = None
    enable_class_weight_balancing: Optional[bool] = None
    email_alerts_on_high_risk: Optional[bool] = None
    maintenance_mode: Optional[bool] = None


@router.post("/settings", response_model=Dict[str, Any])
async def update_admin_settings(
    req: UpdateSettingsRequest,
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Updates system administration preferences."""
    updates = req.model_dump(exclude_unset=True)
    updated = admin_analytics_service.update_settings(updates)
    return {"success": True, "data": updated, "message": "Admin settings updated successfully."}
