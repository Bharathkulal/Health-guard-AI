"""
Tests for the ML prediction service.
"""

import sys
import os
import pytest

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.prediction.predictor import HealthRiskPredictor

def test_predictor_initialization():
    """Test that predictor can initialize and load models."""
    predictor = HealthRiskPredictor()
    # Check if models were trained and loaded
    assert predictor.is_ready()

def test_predict_diabetes_valid_input():
    """Test diabetes prediction with valid mapped inputs."""
    predictor = HealthRiskPredictor()
    input_data = {
        "age": 45,
        "blood_sugar": 150,
        "diastolic_bp": 85,
        "bmi": 30.5,
        "family_history": {"diabetes": True}
    }
    
    result = predictor.predict_diabetes_risk(input_data)
    
    assert "prediction" in result
    assert result["prediction"] in [0, 1]
    assert 0.0 <= result["probability"] <= 1.0
    assert result["features_available"] == 5  # Age, Glucose, BP, BMI, Pedigree
    assert result["features_imputed"] == 3    # Pregnancies, SkinThickness, Insulin

def test_predict_heart_valid_input():
    """Test heart prediction with valid mapped inputs."""
    predictor = HealthRiskPredictor()
    input_data = {
        "age": 55,
        "gender": "male",
        "systolic_bp": 140,
        "blood_sugar": 130, # > 120 -> fbs = 1
        "heart_rate": 150,
        "symptoms": ["chest pain"] # maps to cp=2
    }
    
    result = predictor.predict_heart_risk(input_data)
    
    assert "prediction" in result
    assert result["prediction"] in [0, 1]
    assert 0.0 <= result["probability"] <= 1.0
    assert result["features_available"] == 6  # age, sex, cp, trestbps, fbs, thalach
    assert result["features_imputed"] == 7    # the rest
