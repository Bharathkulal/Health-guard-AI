"""
Backend Prediction Service Layer for HealthGuard AI.
Bridges FastAPI request lifecycles with the trained ML pipelines in ml/models,
persisting calculated risk assessments into MongoDB collection 'risk_assessments'.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

# Ensure ml directory is in python path
ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml"))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.predict import MLPredictionEngine
from app.database.mongodb import get_collection, is_database_connected, COLLECTION_RISK_ASSESSMENTS
from app.models.assessment import generate_assessment_id

logger = logging.getLogger("healthguard.services.prediction")

# Local fallback memory cache for risk predictions
_IN_MEMORY_RISK_ASSESSMENTS: List[Dict[str, Any]] = []


class PredictionService:
    """Service orchestrating multi-factor ML predictions and MongoDB persistence."""

    def __init__(self):
        models_dir = os.path.join(ML_ROOT, "models")
        self.engine = MLPredictionEngine(models_dir=models_dir)

    def get_models_metadata(self) -> Dict[str, Any]:
        """Returns metadata and test evaluation metrics for all active models."""
        return self.engine.metadata

    async def predict_and_store(
        self,
        assessment_data: Dict[str, Any],
        assessment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes real-time inference on the trained ML pipelines for Diabetes, Cardiovascular Disease,
        and Hypertension, and stores the comprehensive prediction output in MongoDB.
        """
        rec_id = assessment_id or assessment_data.get("assessment_id") or generate_assessment_id()
        user_id = assessment_data.get("user_id", "usr_alex_chen_892")

        # 1. Run inference through ML engine
        prediction_result = self.engine.predict_risk(assessment_data)

        # 2. Build full persisted risk assessment document
        now = datetime.now(timezone.utc)
        risk_doc = {
            "assessment_id": rec_id,
            "user_id": user_id,
            "created_at": now,
            "overallScore": prediction_result["overallScore"],
            "overallLevel": prediction_result["overallLevel"],
            "confidence": prediction_result["confidence"],
            "categories": prediction_result["categories"],
            "explainableFactors": prediction_result["explainableFactors"],
            "recommendations": prediction_result["recommendations"],
            "modelsUsed": prediction_result["modelsUsed"],
            "clinicalDisclaimer": prediction_result["clinicalDisclaimer"],
            "vitalsSnapshot": {
                "systolicBP": assessment_data.get("systolic_bp") or assessment_data.get("vitals", {}).get("systolic_bp") or assessment_data.get("vitals", {}).get("systolicBP") or 120,
                "diastolicBP": assessment_data.get("diastolic_bp") or assessment_data.get("vitals", {}).get("diastolic_bp") or assessment_data.get("vitals", {}).get("diastolicBP") or 80,
                "fastingBloodSugar": assessment_data.get("blood_sugar") or assessment_data.get("vitals", {}).get("blood_sugar") or assessment_data.get("vitals", {}).get("fastingBloodSugar") or 95,
                "heartRate": assessment_data.get("heart_rate") or assessment_data.get("vitals", {}).get("heart_rate") or assessment_data.get("vitals", {}).get("heartRate") or 72,
                "bmi": assessment_data.get("bmi") or assessment_data.get("vitals", {}).get("bmi") or 24.5,
                "heightCm": assessment_data.get("height_cm") or assessment_data.get("vitals", {}).get("height_cm") or assessment_data.get("vitals", {}).get("heightCm") or 170,
                "weightKg": assessment_data.get("weight_kg") or assessment_data.get("vitals", {}).get("weight_kg") or assessment_data.get("vitals", {}).get("weightKg") or 70,
            },
        }

        # 3. Store in MongoDB collection 'risk_assessments'
        if is_database_connected():
            collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
            if collection is not None:
                try:
                    await collection.insert_one(dict(risk_doc))
                    logger.info(f"Persisted ML risk assessment {rec_id} into MongoDB '{COLLECTION_RISK_ASSESSMENTS}'")
                except Exception as exc:
                    logger.error(f"Failed to insert risk assessment {rec_id} into MongoDB: {exc}")
                    _IN_MEMORY_RISK_ASSESSMENTS.insert(0, risk_doc)
        else:
            logger.info(f"MongoDB not connected. Cached risk assessment {rec_id} in memory fallback.")
            _IN_MEMORY_RISK_ASSESSMENTS.insert(0, risk_doc)

        # Prepare sanitized response
        response_data = dict(risk_doc)
        response_data["created_at"] = now.isoformat()
        if "_id" in response_data:
            response_data["_id"] = str(response_data["_id"])

        return response_data

    async def get_latest_risk_assessment(self, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves the most recent ML risk assessment from MongoDB or cache."""
        if is_database_connected():
            collection = get_collection(COLLECTION_RISK_ASSESSMENTS)
            if collection is not None:
                try:
                    query = {}
                    if user_id:
                        query["user_id"] = user_id
                    doc = await collection.find_one(query, sort=[("created_at", -1)])
                    if doc:
                        clean = dict(doc)
                        if "_id" in clean:
                            clean["_id"] = str(clean["_id"])
                        if isinstance(clean.get("created_at"), datetime):
                            clean["created_at"] = clean["created_at"].isoformat()
                        return clean
                except Exception as exc:
                    logger.error(f"Error fetching latest risk assessment from MongoDB: {exc}")

        # Fallback memory cache
        if _IN_MEMORY_RISK_ASSESSMENTS:
            clean = dict(_IN_MEMORY_RISK_ASSESSMENTS[0])
            if "_id" in clean:
                clean["_id"] = str(clean["_id"])
            if isinstance(clean.get("created_at"), datetime):
                clean["created_at"] = clean["created_at"].isoformat()
            return clean

        return None


prediction_service = PredictionService()
