"""
Integration and Unit Tests for HealthGuard AI Machine Learning & Prediction Endpoints.
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_predict_models_metadata():
    """Verify GET /api/predict/models returns metadata for diabetes, cardio, and hypertension."""
    response = client.get("/api/predict/models")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "diabetes" in data
    assert "cardiovascular" in data
    assert "hypertension" in data
    assert "test_metrics" in data["diabetes"]
    assert "roc_auc" in data["diabetes"]["test_metrics"]


def test_real_ml_prediction_endpoint():
    """Verify POST /api/predict runs ML inference and returns genuine structured risk assessment."""
    sample_assessment = {
        "user_id": "usr_alex_chen_892",
        "age": 45,
        "gender": "male",
        "height_cm": 178.0,
        "weight_kg": 85.0,
        "systolic_bp": 138,
        "diastolic_bp": 88,
        "blood_sugar": 110.0,
        "heart_rate": 78,
        "symptoms": ["fatigue", "excessive_thirst"],
        "lifestyle": {
            "physical_activity": "light",
            "smoking": "current",
            "alcohol": "frequently",
            "sleep_hours": 6.0,
            "diet": "high_carbohydrate"
        },
        "family_history": {
            "diabetes": True,
            "hypertension": True,
            "heart_disease": True,
            "early_heart_attack": False
        }
    }

    response = client.post("/api/predict", json=sample_assessment)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "assessment_id" in data
    assert "overallScore" in data
    assert 0 <= data["overallScore"] <= 100
    assert data["overallLevel"] in ["Low", "Moderate", "Elevated"]
    assert "categories" in data
    assert "diabetes" in data["categories"]
    assert "cardiovascular" in data["categories"]
    assert "hypertension" in data["categories"]
    assert 0.0 <= data["categories"]["diabetes"]["probability"] <= 1.0
    assert len(data["explainableFactors"]) >= 3
    assert len(data["recommendations"]) >= 2

    # Test GET /api/predict/latest
    latest_res = client.get("/api/predict/latest")
    assert latest_res.status_code == 200
    latest_json = latest_res.json()
    assert latest_json["success"] is True
    assert latest_json["data"]["assessment_id"] == data["assessment_id"]


if __name__ == "__main__":
    print("Running HealthGuard AI ML Prediction Tests...")
    test_predict_models_metadata()
    print("[PASS] Model metadata endpoint passed")
    test_real_ml_prediction_endpoint()
    print("[PASS] Real ML prediction and persistence passed")
    print("\nALL ML ENDPOINT INTEGRATION TESTS PASSED!")
