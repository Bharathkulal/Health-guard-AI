"""
MongoDB Assessment Document Model and Utilities.
"""

from typing import Dict, Any
from datetime import datetime, timezone
import uuid


def generate_assessment_id() -> str:
    """Generates a human-friendly clinical assessment identifier (e.g., HG-A9284)."""
    short = uuid.uuid4().hex[:6].upper()
    return f"HG-A{short}"


def assessment_doc_to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Converts a raw MongoDB assessment document into a JSON-serializable dictionary."""
    if not doc:
        return {}
    clean = dict(doc)
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
    if isinstance(clean.get("created_at"), datetime):
        clean["created_at"] = clean["created_at"].isoformat()
    return clean
