"""
HealthGuard AI - Authentication, Authorization & User Identity Service.
Handles registration, bcrypt verification, JWT generation, user profile persistence,
password modifications, and account lifecycle management.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token
from app.database.mongodb import (
    get_collection,
    is_database_connected,
    COLLECTION_USERS,
    COLLECTION_HEALTH_ASSESSMENTS,
    COLLECTION_RISK_ASSESSMENTS,
)
from app.models.user import generate_user_id, user_doc_to_dict
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    PasswordChangeRequest,
    AccountDeleteRequest,
    UserProfileUpdate,
    UserResponse,
    UserAuthResponse,
)

logger = logging.getLogger("healthguard.services.auth")

# In-memory user store used as fallback when MongoDB is offline / during local test runs
_IN_MEMORY_USERS: List[Dict[str, Any]] = [
    {
        "user_id": "usr_alex_chen_892",
        "name": "Alex Chen",
        "email": "alex.chen@healthguard.ai",
        "hashed_password": hash_password("HealthGuard2026!"),
        "created_at": datetime.now(timezone.utc),
        "age": 38,
        "gender": "male",
        "height_cm": 178.0,
        "weight_kg": 78.0,
        "bmi": 24.6,
        "baseline_activity": "moderate",
        "blood_type": "A+",
        "emergency_contact": "+1 (555) 234-8901",
        "member_since": "March 2025",
    }
]


class AuthService:
    """Service encapsulating user registration, authentication, authorization and lifecycle."""

    async def get_user_assessment_count(self, user_id: str) -> int:
        """Calculates total health assessments completed by a given user."""
        if is_database_connected():
            col = get_collection(COLLECTION_HEALTH_ASSESSMENTS)
            if col is not None:
                try:
                    return await col.count_documents({"user_id": user_id})
                except Exception as exc:
                    logger.warning(f"Failed to count assessments for {user_id}: {exc}")
        
        # Fallback to counting in in-memory store if needed
        from app.services.assessment_service import _IN_MEMORY_ASSESSMENTS
        return sum(1 for a in _IN_MEMORY_ASSESSMENTS if a.get("user_id") == user_id)

    def _format_user_response(self, user_doc: Dict[str, Any], count: int = 0) -> UserResponse:
        """Converts a raw user document into a sanitized UserResponse schema."""
        created_at_str = None
        member_since = user_doc.get("member_since")
        if isinstance(user_doc.get("created_at"), datetime):
            dt = user_doc["created_at"]
            created_at_str = dt.isoformat()
            if not member_since:
                member_since = dt.strftime("%B %Y")
        elif isinstance(user_doc.get("created_at"), str):
            created_at_str = user_doc["created_at"]
            if not member_since:
                member_since = "Recent"

        return UserResponse(
            user_id=user_doc["user_id"],
            name=user_doc.get("name", "User"),
            email=user_doc.get("email"),
            created_at=created_at_str,
            member_since=member_since or "Recent",
            age=user_doc.get("age"),
            gender=user_doc.get("gender", "other"),
            height_cm=user_doc.get("height_cm"),
            weight_kg=user_doc.get("weight_kg"),
            bmi=user_doc.get("bmi"),
            baseline_activity=user_doc.get("baseline_activity", "moderate"),
            blood_type=user_doc.get("blood_type", "A+"),
            emergency_contact=user_doc.get("emergency_contact"),
            assessment_count=count,
        )

    async def find_user_by_email(self, email: str, include_sensitive: bool = True) -> Optional[Dict[str, Any]]:
        """Finds a user document by normalized lowercase email."""
        norm_email = email.strip().lower()

        if is_database_connected():
            col = get_collection(COLLECTION_USERS)
            if col is not None:
                try:
                    doc = await col.find_one({"email": norm_email})
                    if doc:
                        return user_doc_to_dict(doc, include_sensitive=include_sensitive)
                except Exception as exc:
                    logger.error(f"Error querying user by email in MongoDB: {exc}")

        # Memory store lookup
        for u in _IN_MEMORY_USERS:
            if u.get("email", "").lower() == norm_email:
                return user_doc_to_dict(u, include_sensitive=include_sensitive)

        return None

    async def find_user_by_id(self, user_id: str, include_sensitive: bool = False) -> Optional[Dict[str, Any]]:
        """Finds a user document by unique user_id."""
        if is_database_connected():
            col = get_collection(COLLECTION_USERS)
            if col is not None:
                try:
                    doc = await col.find_one({"user_id": user_id})
                    if doc:
                        return user_doc_to_dict(doc, include_sensitive=include_sensitive)
                except Exception as exc:
                    logger.error(f"Error querying user by id in MongoDB: {exc}")

        # Memory store lookup
        for u in _IN_MEMORY_USERS:
            if u.get("user_id") == user_id:
                return user_doc_to_dict(u, include_sensitive=include_sensitive)

        return None

    async def register_user(self, reg_in: UserRegisterRequest) -> UserAuthResponse:
        """
        Registers a new user account with secure bcrypt password hashing.
        Rejects duplicate email addresses.
        """
        norm_email = reg_in.email.strip().lower()
        existing = await self.find_user_by_email(norm_email)
        if existing:
            logger.info(f"Registration rejected: account already exists for {norm_email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address is already registered.",
            )

        user_id = generate_user_id()
        hashed = hash_password(reg_in.password)
        now = datetime.now(timezone.utc)

        user_doc = {
            "user_id": user_id,
            "name": reg_in.name.strip(),
            "email": norm_email,
            "hashed_password": hashed,
            "created_at": now,
            "updated_at": now,
            "member_since": now.strftime("%B %Y"),
            "age": None,
            "gender": "other",
            "height_cm": None,
            "weight_kg": None,
            "bmi": None,
            "baseline_activity": "moderate",
            "blood_type": "A+",
            "emergency_contact": None,
        }

        # Save to DB
        if is_database_connected():
            col = get_collection(COLLECTION_USERS)
            if col is not None:
                try:
                    await col.insert_one(dict(user_doc))
                    logger.info(f"Created new user record {user_id} in MongoDB.")
                except Exception as exc:
                    logger.error(f"Failed to insert user {user_id} into MongoDB: {exc}")
                    _IN_MEMORY_USERS.append(dict(user_doc))
        else:
            _IN_MEMORY_USERS.append(dict(user_doc))

        token = create_access_token(subject=user_id, email=norm_email)
        user_res = self._format_user_response(user_doc, count=0)
        logger.info(f"User registration successful for {user_id} ({norm_email})")
        return UserAuthResponse(access_token=token, token_type="bearer", user=user_res)

    async def authenticate_user(self, login_in: UserLoginRequest) -> UserAuthResponse:
        """
        Validates credentials and issues a signed JWT access token.
        Uses generic error details to prevent account enumeration.
        """
        norm_email = login_in.email.strip().lower()
        user_doc = await self.find_user_by_email(norm_email, include_sensitive=True)

        if not user_doc or not verify_password(login_in.password, user_doc.get("hashed_password", "")):
            logger.warning(f"Failed authentication attempt for email: {norm_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = user_doc["user_id"]
        token = create_access_token(subject=user_id, email=norm_email)
        count = await self.get_user_assessment_count(user_id)
        user_res = self._format_user_response(user_doc, count=count)
        logger.info(f"User login successful: {user_id} ({norm_email})")
        return UserAuthResponse(access_token=token, token_type="bearer", user=user_res)

    async def get_current_user_profile(self, user_id: str) -> UserResponse:
        """Returns the sanitized profile for an authenticated user."""
        user_doc = await self.find_user_by_id(user_id, include_sensitive=False)
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )
        count = await self.get_user_assessment_count(user_id)
        return self._format_user_response(user_doc, count=count)

    async def update_user_profile(self, user_id: str, updates_in: UserProfileUpdate) -> UserResponse:
        """Updates permitted demographic and biometric attributes on a user profile."""
        user_doc = await self.find_user_by_id(user_id, include_sensitive=True)
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        update_dict = updates_in.model_dump(exclude_unset=True)
        if not update_dict:
            count = await self.get_user_assessment_count(user_id)
            return self._format_user_response(user_doc, count=count)

        # Recalculate BMI if height or weight were modified
        h = update_dict.get("height_cm", user_doc.get("height_cm"))
        w = update_dict.get("weight_kg", user_doc.get("weight_kg"))
        if h and w and h > 0 and w > 0:
            update_dict["bmi"] = round(w / ((h / 100.0) ** 2), 1)

        update_dict["updated_at"] = datetime.now(timezone.utc)

        # Persist to MongoDB
        if is_database_connected():
            col = get_collection(COLLECTION_USERS)
            if col is not None:
                try:
                    await col.update_one({"user_id": user_id}, {"$set": update_dict})
                except Exception as exc:
                    logger.error(f"Failed to update user {user_id} in MongoDB: {exc}")

        # Update in-memory fallback
        for u in _IN_MEMORY_USERS:
            if u.get("user_id") == user_id:
                u.update(update_dict)
                user_doc = dict(u)
                break
        else:
            user_doc.update(update_dict)

        count = await self.get_user_assessment_count(user_id)
        logger.info(f"User profile updated for {user_id}")
        return self._format_user_response(user_doc, count=count)

    async def change_password(self, user_id: str, change_in: PasswordChangeRequest) -> bool:
        """Verifies current password and sets a newly hashed password."""
        user_doc = await self.find_user_by_id(user_id, include_sensitive=True)
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        if not verify_password(change_in.current_password, user_doc.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        new_hash = hash_password(change_in.new_password)
        now = datetime.now(timezone.utc)

        if is_database_connected():
            col = get_collection(COLLECTION_USERS)
            if col is not None:
                try:
                    await col.update_one(
                        {"user_id": user_id},
                        {"$set": {"hashed_password": new_hash, "updated_at": now}}
                    )
                except Exception as exc:
                    logger.error(f"Failed to update password for {user_id} in MongoDB: {exc}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to update password. Please try again.",
                    )

        # Update memory store
        for u in _IN_MEMORY_USERS:
            if u.get("user_id") == user_id:
                u["hashed_password"] = new_hash
                u["updated_at"] = now
                break

        logger.info(f"Password changed successfully for user {user_id}")
        return True

    async def delete_user_account(self, user_id: str, delete_in: AccountDeleteRequest) -> bool:
        """
        Cascading user account deletion.
        Permanently removes user profile, health assessments, and risk predictions.
        """
        user_doc = await self.find_user_by_id(user_id, include_sensitive=True)
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        if not verify_password(delete_in.password, user_doc.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password. Account deletion aborted.",
            )

        if is_database_connected():
            users_col = get_collection(COLLECTION_USERS)
            assessments_col = get_collection(COLLECTION_HEALTH_ASSESSMENTS)
            risk_col = get_collection(COLLECTION_RISK_ASSESSMENTS)

            try:
                if users_col is not None:
                    await users_col.delete_one({"user_id": user_id})
                if assessments_col is not None:
                    await assessments_col.delete_many({"user_id": user_id})
                if risk_col is not None:
                    await risk_col.delete_many({"user_id": user_id})
                logger.info(f"Permanently wiped all clinical and profile data for {user_id} in MongoDB.")
            except Exception as exc:
                logger.error(f"Error during cascading account deletion for {user_id}: {exc}")

        # Remove from memory stores
        global _IN_MEMORY_USERS
        _IN_MEMORY_USERS = [u for u in _IN_MEMORY_USERS if u.get("user_id") != user_id]

        from app.services.assessment_service import _IN_MEMORY_ASSESSMENTS
        from app.services.prediction_service import _IN_MEMORY_RISK_ASSESSMENTS
        
        _IN_MEMORY_ASSESSMENTS[:] = [a for a in _IN_MEMORY_ASSESSMENTS if a.get("user_id") != user_id]
        _IN_MEMORY_RISK_ASSESSMENTS[:] = [r for r in _IN_MEMORY_RISK_ASSESSMENTS if r.get("user_id") != user_id]

        logger.info(f"Account {user_id} and all associated telemetry successfully deleted.")
        return True


auth_service = AuthService()
