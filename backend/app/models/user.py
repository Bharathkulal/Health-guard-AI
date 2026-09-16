"""
MongoDB User Document Model and Utilities.
"""

import uuid
from typing import Dict, Any, Optional
from datetime import datetime


def generate_user_id() -> str:
    """Generates a unique, non-guessable user identifier."""
    return f"usr_{uuid.uuid4().hex[:12]}"


def user_doc_to_dict(doc: Dict[str, Any], include_sensitive: bool = False) -> Dict[str, Any]:
    """
    Sanitizes a MongoDB user document for application or API consumption.
    By default, strips hashed passwords and internal DB IDs unless explicitly requested.
    """
    if not doc:
        return {}
    clean = dict(doc)
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
    if isinstance(clean.get("created_at"), datetime):
        clean["created_at"] = clean["created_at"].isoformat()
    if isinstance(clean.get("updated_at"), datetime):
        clean["updated_at"] = clean["updated_at"].isoformat()

    if not include_sensitive:
        clean.pop("hashed_password", None)
        clean.pop("password", None)

    return clean
