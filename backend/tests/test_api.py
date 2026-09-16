"""
Integration and Unit Tests for HealthGuard AI FastAPI Endpoints.
"""

import os
import sys
import uuid
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_token():
    """Helper to register and obtain access token for testing."""
    email = f"apitest.{uuid.uuid4().hex[:8]}@example.com"
    pwd = "ApiTestPassword2026!"
    res = client.post(
        "/api/auth/register",
        json={"name": "API Tester", "email": email, "password": pwd, "confirm_password": pwd},
    )
    return res.json()["data"]["access_token"]


def test_health_endpoint():
    """Verify GET /api/health returns ok status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "healthguard-api"
    assert "database" in data


def test_create_valid_assessment():
    """Verify POST /api/assessments validates and stores health assessment."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "age": 42,
        "gender": "female",
        "height_cm": 165.0,
        "weight_kg": 68.0,
        "systolic_bp": 128,
        "diastolic_bp": 82,
        "blood_sugar": 105.0,
        "heart_rate": 76,
        "symptoms": ["fatigue", "excessive_thirst"],
        "lifestyle": {
            "physical_activity": "moderate",
            "smoking": "never",
            "alcohol": "occasional",
            "sleep_hours": 7.5,
            "diet": "balanced"
        },
        "family_history": {
            "diabetes": True,
            "hypertension": False,
            "heart_disease": True,
            "early_heart_attack": False
        }
    }

    response = client.post("/api/assessments", json=payload, headers=headers)
    assert response.status_code == 201
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["message"] == "Assessment saved successfully"
    data = res_json["data"]
    assert "assessment_id" in data
    assert data["status"] == "received"
    assert data["age"] == 42
    assert data["gender"] == "female"
    assert data["bmi"] == round(68.0 / ((165.0 / 100.0) ** 2), 1)

    assessment_id = data["assessment_id"]

    # Test GET by ID
    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    assert get_res.status_code == 200
    get_json = get_res.json()
    assert get_json["success"] is True
    assert get_json["data"]["assessment_id"] == assessment_id

    # Test GET history
    history_res = client.get("/api/assessments", headers=headers)
    assert history_res.status_code == 200
    history_json = history_res.json()
    assert history_json["success"] is True
    assert len(history_json["data"]) >= 1


def test_validation_errors():
    """Verify invalid health data receives structured 422 errors."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    invalid_payload = {
        "age": 10,  # Below adult threshold 18
        "gender": "female",
        "height_cm": 165.0,
        "weight_kg": 68.0,
        "systolic_bp": 450,  # Out of realistic range
        "diastolic_bp": 82,
        "blood_sugar": 105.0,
        "heart_rate": 76,
    }

    response = client.post("/api/assessments", json=invalid_payload, headers=headers)
    assert response.status_code == 422
    res_json = response.json()
    assert res_json["success"] is False
    assert "errors" in res_json
    assert len(res_json["errors"]) > 0


if __name__ == "__main__":
    print("Running HealthGuard AI Backend Tests...")
    test_health_endpoint()
    print("[PASS] Health endpoint passed")
    test_create_valid_assessment()
    print("[PASS] Create assessment and retrieval passed")
    test_validation_errors()
    print("[PASS] Validation constraint tests passed")
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
