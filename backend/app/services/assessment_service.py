"""
Health Assessment Business Logic & Persistence Service.
Handles MongoDB ingestion, querying, user data isolation, and resilient fallback storage.
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from app.database.mongodb import get_collection, is_database_connected, COLLECTION_HEALTH_ASSESSMENTS
from app.models.assessment import generate_assessment_id, assessment_doc_to_dict
from app.schemas.assessment import HealthAssessmentCreate

logger = logging.getLogger("healthguard.services.assessment")

# In-memory storage cache used for fallback when MongoDB is offline or in test mode
_IN_MEMORY_ASSESSMENTS: List[Dict[str, Any]] = []


class AssessmentService:
    """Service handling multi-factor health assessments persistence, queries, and authorization."""

    async def create_assessment(
        self,
        assessment_in: HealthAssessmentCreate,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Stores a newly completed health assessment in MongoDB.
        Enforces user ownership by deriving user_id from the authenticated request context.
        """
        assessment_id = generate_assessment_id()
        now = datetime.now(timezone.utc)

        # Build document with forced authenticated user_id
        doc = {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "status": "received",
            "created_at": now,
            "demographics": {
                "age": assessment_in.age,
                "gender": assessment_in.gender,
            },
            "vitals": {
                "height_cm": assessment_in.height_cm,
                "weight_kg": assessment_in.weight_kg,
                "bmi": assessment_in.bmi,
                "systolic_bp": assessment_in.systolic_bp,
                "diastolic_bp": assessment_in.diastolic_bp,
                "blood_sugar": assessment_in.blood_sugar,
                "heart_rate": assessment_in.heart_rate,
            },
            "symptoms": assessment_in.symptoms,
            "lifestyle": assessment_in.lifestyle.model_dump(),
            "family_history": assessment_in.family_history.model_dump(),
            "ml_features_ready": True,
            "raw_payload": assessment_in.model_dump(),
        }

        # Attempt to save to MongoDB
        if is_database_connected():
            collection = get_collection(COLLECTION_HEALTH_ASSESSMENTS)
            if collection is not None:
                try:
                    await collection.insert_one(dict(doc))
                    logger.info(f"Saved assessment {assessment_id} for user {user_id} to MongoDB.")
                except Exception as exc:
                    logger.error(f"Failed to insert assessment {assessment_id} into MongoDB: {exc}")
                    _IN_MEMORY_ASSESSMENTS.insert(0, dict(doc))
        else:
            logger.info(f"MongoDB not connected. Cached assessment {assessment_id} in memory fallback storage.")
            _IN_MEMORY_ASSESSMENTS.insert(0, dict(doc))

        # Construct sanitized response matching specification
        return {
            "assessment_id": assessment_id,
            "status": "received",
            "user_id": user_id,
            "created_at": now.isoformat(),
            "age": assessment_in.age,
            "gender": assessment_in.gender,
            "height_cm": assessment_in.height_cm,
            "weight_kg": assessment_in.weight_kg,
            "bmi": assessment_in.bmi,
            "systolic_bp": assessment_in.systolic_bp,
            "diastolic_bp": assessment_in.diastolic_bp,
            "blood_sugar": assessment_in.blood_sugar,
            "heart_rate": assessment_in.heart_rate,
            "symptoms": assessment_in.symptoms,
            "lifestyle": assessment_in.lifestyle.model_dump(),
            "family_history": assessment_in.family_history.model_dump(),
            "message": "Assessment received and stored securely. Ready for ML risk analysis pipeline.",
        }

    async def get_assessment_by_id(
        self,
        assessment_id: str,
        user_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single assessment by ID.
        If user_id is provided, strictly enforces object-level authorization (IDOR defense).
        """
        if is_database_connected():
            collection = get_collection(COLLECTION_HEALTH_ASSESSMENTS)
            if collection is not None:
                try:
                    query: Dict[str, Any] = {"assessment_id": assessment_id}
                    if user_id:
                        query["user_id"] = user_id
                    doc = await collection.find_one(query)
                    if doc:
                        return assessment_doc_to_dict(doc)
                except Exception as exc:
                    logger.error(f"Error querying MongoDB for assessment {assessment_id}: {exc}")

        # Check memory fallback
        for item in _IN_MEMORY_ASSESSMENTS:
            if item.get("assessment_id") == assessment_id:
                if user_id and item.get("user_id") != user_id:
                    # User does not own this record
                    return None
                return assessment_doc_to_dict(item)

        return None

    async def get_assessment_history(
        self,
        user_id: str,
        limit: int = 50,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Fetches historical assessment records strictly scoped to the authenticated user.
        """
        results: List[Dict[str, Any]] = []

        if is_database_connected():
            collection = get_collection(COLLECTION_HEALTH_ASSESSMENTS)
            if collection is not None:
                try:
                    query = {"user_id": user_id}
                    cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
                    async for doc in cursor:
                        results.append(assessment_doc_to_dict(doc))
                    return results
                except Exception as exc:
                    logger.error(f"Error reading assessment history from MongoDB: {exc}")

        # Fallback memory
        filtered = [a for a in _IN_MEMORY_ASSESSMENTS if a.get("user_id") == user_id]
        for item in filtered[skip : skip + limit]:
            results.append(assessment_doc_to_dict(item))

        return results


assessment_service = AssessmentService()
