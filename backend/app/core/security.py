"""
HealthGuard AI - Cryptographic Security, Password Hashing & JWT Management.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import bcrypt
import jwt

from app.core.config import settings

logger = logging.getLogger("healthguard.security")


def hash_password(password: str) -> str:
    """
    Hashes a plaintext password using bcrypt with automatic salt generation.
    Never logs or stores the plaintext password.
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hash.
    Constant-time comparison prevents timing attacks.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception as exc:
        logger.warning(f"Password verification encountered an error: {exc}")
        return False


def create_access_token(
    subject: str,
    email: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Creates a cryptographically signed JWT access token.
    Contains minimal identity claims (sub = user_id, email) and never contains sensitive health data.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }
    if email:
        payload["email"] = email

    if additional_claims:
        # Prevent overwriting core security claims
        for k, v in additional_claims.items():
            if k not in ["sub", "exp", "iat", "type", "vitals", "health_data", "assessments"]:
                payload[k] = v

    encoded_jwt = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and cryptographically validates a JWT token.
    Returns token payload dict if valid, or None if expired/malformed.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat"]},
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.debug("JWT token signature expired.")
        return None
    except jwt.InvalidTokenError as exc:
        logger.debug(f"Invalid JWT token: {exc}")
        return None
    except Exception as exc:
        logger.warning(f"Unexpected error decoding JWT token: {exc}")
        return None
