"""
MongoDB User Document Model and Utilities.
"""

from typing import Dict, Any


def user_doc_to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    clean = dict(doc)
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
    return clean
