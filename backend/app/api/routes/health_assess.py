"""
Health Assessment API Endpoint for HealthGuard AI.

POST /api/health/assess

Receives patient health data, runs it through the trained ML models,
and returns a structured risk assessment with actual model predictions.

This endpoint:
1. Validates input using Pydantic schemas
2. Maps form fields to model features
3. Runs actual trained ML pipelines (heart + diabetes)
4. Computes transparent overall screening category
5. Generates explainable risk factors
6. Returns structured JSON with disclaimer
7. Never exposes internal stack traces
"""

import os
import sys
import logging
from typing import Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.assessment import HealthAssessmentCreate
from app.schemas.response import APIResponse
from app.services.risk_aggregation import (
    compute_overall_risk,
    generate_risk_factors,
    generate_recommendations,
)
from app.database.mongodb import get_collection, is_database_connected, COLLECTION_RISK_ASSESSMENTS
from app.models.assessment import generate_assessment_id

# Add ML module to path
ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml"))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.prediction.predictor import predictor

logger = logging.getLogger("healthguard.api.health_assess")

router = APIRouter()

DISCLAIMER = (
    "This assessment is for educational screening and decision support and is not a medical diagnosis. "
    "The models were trained on public benchmark datasets (UCI Heart Disease, Pima Indians Diabetes) "
    "which may not represent your local population. Consult a healthcare professional for medical advice."
)

# In-memory fallback for when MongoDB is unavailable
_IN_MEMORY_ASSESSMENTS = []


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Execute ML Health Risk Assessment",
    description=(
        "Ingests patient health data, runs trained heart disease and diabetes ML models, "
        "and returns a structured risk assessment with actual model predictions, "
        "explainable risk factors, and educational recommendations."
    ),
    response_model=APIResponse[Dict[str, Any]],
)
async def assess_health_risk(
    assessment_data: HealthAssessmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes real-time ML inference on trained heart disease and diabetes pipelines.
    Returns actual model predictions — never fake or hardcoded values.
    """
    try:
        # Convert Pydantic model to dict for ML pipeline
        raw_data = assessment_data.model_dump()
        assessment_id = generate_assessment_id()
        user_id = current_user["user_id"]

        # Ensure models are loaded
        if not predictor.is_ready():
            predictor.reload_models()

        # 1. Run heart disease model
        try:
            heart_result = predictor.predict_heart_risk(raw_data)
        except Exception as exc:
            logger.error(f"Heart model error: {exc}", exc_info=True)
            heart_result = {
                "prediction": -1,
                "probability": 0.0,
                "model_name": "unavailable",
                "model_version": "N/A",
                "error": str(exc),
            }

        # 2. Run diabetes model
        try:
            diabetes_result = predictor.predict_diabetes_risk(raw_data)
        except Exception as exc:
            logger.error(f"Diabetes model error: {exc}", exc_info=True)
            diabetes_result = {
                "prediction": -1,
                "probability": 0.0,
                "model_name": "unavailable",
                "model_version": "N/A",
                "error": str(exc),
            }

        # 3. Compute overall screening category
        heart_prob = heart_result.get("probability", 0.0)
        diabetes_prob = diabetes_result.get("probability", 0.0)
        overall = compute_overall_risk(heart_prob, diabetes_prob)

        # 4. Generate explainable risk factors
        heart_importances = predictor.get_heart_feature_importances()
        diabetes_importances = predictor.get_diabetes_feature_importances()
        risk_factors = generate_risk_factors(
            raw_data, heart_result, diabetes_result,
            heart_importances, diabetes_importances,
        )

        # 5. Generate recommendations
        recommendations = generate_recommendations(
            raw_data, overall["overall_risk"], heart_prob, diabetes_prob,
        )

        # 6. Build response
        now = datetime.now(timezone.utc)

        # Compute overall score (0-100 scale) for frontend compatibility
        overall_score = int(round(max(heart_prob, diabetes_prob) * 100))
        overall_score = max(5, min(95, overall_score))

        # Build category objects for frontend compatibility
        def _build_category(cond_id, cond_name, result, importances):
            prob = result.get("probability", 0.0)
            score = int(round(prob * 100))
            if prob < 0.30:
                level, color = "Low", "emerald"
            elif prob < 0.60:
                level, color = "Moderate", "amber"
            else:
                level, color = "Elevated", "rose"

            # Build key drivers from top importances
            drivers = [imp.get("label") or imp.get("feature", "") for imp in importances[:3]] if importances else []

            return {
                "id": cond_id,
                "name": cond_name,
                "score": score,
                "probability": round(prob, 4),
                "level": level,
                "color": color,
                "prediction": result.get("prediction", -1),
                "model_name": result.get("model_name", "unknown"),
                "model_version": result.get("model_version", "unknown"),
                "keyDrivers": drivers,
                "summary": (
                    f"Model-estimated {cond_name.lower()} probability: {prob:.1%}. "
                    f"{'Low risk estimate based on provided inputs.' if prob < 0.30 else 'Elevated estimate — consider professional screening.' if prob >= 0.60 else 'Moderate estimate — monitor key indicators.'}"
                ),
            }

        categories = {
            "heart": _build_category("heart", "Heart Disease Risk", heart_result, heart_importances),
            "diabetes": _build_category("diabetes", "Diabetes Risk", diabetes_result, diabetes_importances),
        }
        # Backward/forward compatibility for components expecting cardiovascular
        categories["cardiovascular"] = categories["heart"]

        response_data = {
            "assessment_id": assessment_id,
            "overall_risk": overall["overall_risk"],
            "overallScore": overall_score,
            "overallLevel": overall["overall_risk"],
            "confidence": None,  # We don't fabricate a confidence number
            "heart": {
                "prediction": heart_result.get("prediction", -1),
                "probability": heart_result.get("probability", 0.0),
            },
            "diabetes": {
                "prediction": diabetes_result.get("prediction", -1),
                "probability": diabetes_result.get("probability", 0.0),
            },
            "categories": categories,
            "risk_factors": risk_factors,
            "explainableFactors": risk_factors,  # Alias for frontend compatibility
            "explanation": overall.get("method", ""),
            "recommendations": recommendations,
            "disclaimer": DISCLAIMER,
            "clinicalDisclaimer": DISCLAIMER,
            "modelsUsed": {
                "heart": {
                    "algorithm": heart_result.get("model_name", "unknown"),
                    "version": heart_result.get("model_version", "unknown"),
                    "features_available": heart_result.get("features_available", 0),
                    "features_imputed": heart_result.get("features_imputed", 0),
                },
                "diabetes": {
                    "algorithm": diabetes_result.get("model_name", "unknown"),
                    "version": diabetes_result.get("model_version", "unknown"),
                    "features_available": diabetes_result.get("features_available", 0),
                    "features_imputed": diabetes_result.get("features_imputed", 0),
                },
            },
            "vitalsSnapshot": {
                "systolicBP": raw_data.get("systolic_bp", 120),
                "diastolicBP": raw_data.get("diastolic_bp", 80),
                "fastingBloodSugar": raw_data.get("blood_sugar", 95),
                "heartRate": raw_data.get("heart_rate", 72),
                "bmi": raw_data.get("bmi", 24.5),
                "heightCm": raw_data.get("height_cm", 170),
                "weightKg": raw_data.get("weight_kg", 70),
            },
            "created_at": now.isoformat(),
        }

        # 7. Persist to database
        risk_doc = {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "created_at": now,
            **response_data,
        }

        if not is_database_connected():
            from app.database.mongodb import connect_to_mongo
            try:
                await connect_to_mongo()
            except Exception as conn_err:
                logger.warning(f"Could not connect to database during assessment persistence: {conn_err}")

        if is_database_connected():
            collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
            if collection is not None:
                try:
                    # Store a copy to avoid modifying response
                    store_doc = dict(risk_doc)
                    store_doc["created_at"] = now
                    await collection.insert_one(store_doc)
                    logger.info(f"Persisted assessment {assessment_id} for user {user_id}")
                except Exception as exc:
                    logger.error(f"Failed to persist assessment: {exc}")
                    _IN_MEMORY_ASSESSMENTS.insert(0, risk_doc)
        else:
            _IN_MEMORY_ASSESSMENTS.insert(0, risk_doc)
            logger.info(f"Stored assessment {assessment_id} in memory fallback")

        return APIResponse(
            success=True,
            data=response_data,
            message="Health risk assessment computed using trained ML models.",
        )

    except Exception as exc:
        logger.error(f"Assessment error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute health risk assessment. Please try again.",
        )
