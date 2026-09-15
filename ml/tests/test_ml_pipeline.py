"""
Unit & Integration Tests for HealthGuard AI Machine Learning Pipeline.
Tests data loaders, preprocessing, feature extraction, model inference, and explainability.
"""

import os
import sys
import pytest
import numpy as np
import pandas as pd

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.data_loader import (
    load_diabetes_dataset,
    load_cardiovascular_dataset,
    load_hypertension_dataset,
)
from src.features import (
    DIABETES_FEATURES,
    CARDIOVASCULAR_FEATURES,
    HYPERTENSION_FEATURES,
    compute_bmi,
    compute_pulse_pressure,
    map_activity_to_numeric,
    map_smoking_to_numeric,
    extract_features_from_assessment,
)
from src.preprocessing import build_preprocessor, ClinicalOutlierClipper
from src.predict import MLPredictionEngine


def test_data_loaders_structure():
    """Verify raw datasets load with expected columns, records, and label types."""
    df_diab = load_diabetes_dataset(sample_size=100)
    assert len(df_diab) >= 100
    assert "diabetes" in df_diab.columns
    for col in DIABETES_FEATURES:
        assert col in df_diab.columns

    df_cardio = load_cardiovascular_dataset(sample_size=100)
    assert len(df_cardio) >= 100
    assert "cardio" in df_cardio.columns
    for col in CARDIOVASCULAR_FEATURES:
        assert col in df_cardio.columns

    df_htn = load_hypertension_dataset(sample_size=100)
    assert len(df_htn) >= 100
    assert "hypertension" in df_htn.columns
    for col in HYPERTENSION_FEATURES:
        assert col in df_htn.columns


def test_biometric_calculations():
    """Verify clinical calculation helpers."""
    bmi = compute_bmi(180, 80)
    assert round(bmi, 1) == 24.7

    pp = compute_pulse_pressure(130, 85)
    assert pp == 45

    assert map_activity_to_numeric("sedentary") == 0
    assert map_activity_to_numeric("active") == 3
    assert map_smoking_to_numeric("never") == 0
    assert map_smoking_to_numeric("current") == 2


def test_preprocessing_pipeline_handles_missing_and_outliers():
    """Verify preprocessing imputes missing values and clips biological anomalies without errors."""
    preprocessor = build_preprocessor(["age", "bmi", "systolic_bp"])
    
    # Create sample DataFrame with an outlier (SBP=350) and a missing value
    raw_df = pd.DataFrame({
        "age": [45, 60, np.nan],
        "bmi": [24.0, 32.5, 28.0],
        "systolic_bp": [120, 350, 140],  # 350 should be clipped to <=260
    })
    
    transformed = preprocessor.fit_transform(raw_df)
    assert transformed.shape == (3, 3)
    assert not np.isnan(transformed).any()


def test_feature_extraction_from_nested_and_flat_payloads():
    """Verify feature extractor handles both nested and flat assessment dictionaries."""
    nested_assessment = {
        "age": 48,
        "gender": "female",
        "vitals": {
            "systolic_bp": 135,
            "diastolic_bp": 85,
            "blood_sugar": 110,
            "heart_rate": 76,
            "height_cm": 165,
            "weight_kg": 68,
            "bmi": 25.0,
        },
        "lifestyle": {
            "physical_activity": "moderate",
            "smoking": "never",
            "alcohol": "occasional",
            "sleep_hours": 7.5,
        },
        "family_history": {
            "diabetes": True,
            "hypertension": False,
            "heart_disease": False,
        },
        "symptoms": ["fatigue"],
    }
    
    dfs = extract_features_from_assessment(nested_assessment)
    assert "diabetes" in dfs
    assert "cardiovascular" in dfs
    assert "hypertension" in dfs
    
    assert dfs["diabetes"].shape == (1, len(DIABETES_FEATURES))
    assert dfs["cardiovascular"].shape == (1, len(CARDIOVASCULAR_FEATURES))
    assert dfs["hypertension"].shape == (1, len(HYPERTENSION_FEATURES))
    assert dfs["diabetes"]["family_history_diabetes"].iloc[0] == 1


def test_ml_prediction_engine_inference():
    """Verify MLPredictionEngine loads models and produces valid probabilistic outputs."""
    engine = MLPredictionEngine()
    assert engine.is_ready()

    sample_patient = {
        "age": 52,
        "gender": "male",
        "vitals": {
            "systolic_bp": 145,
            "diastolic_bp": 92,
            "blood_sugar": 140,
            "heart_rate": 80,
            "height_cm": 178,
            "weight_kg": 90,
            "bmi": 28.4,
        },
        "lifestyle": {
            "physical_activity": "light",
            "smoking": "current",
            "alcohol": "frequent",
            "sleep_hours": 5.5,
        },
        "family_history": {
            "diabetes": True,
            "hypertension": True,
            "heart_disease": True,
        },
        "symptoms": ["fatigue", "blurred_vision"],
    }

    result = engine.predict_risk(sample_patient)

    # 1. Overall Score bounds
    assert 0 <= result["overallScore"] <= 100
    assert result["overallLevel"] in ["Low", "Moderate", "Elevated"]
    
    # 2. Category probabilities
    for cond in ["diabetes", "cardiovascular", "hypertension"]:
        cat = result["categories"][cond]
        assert 0.0 <= cat["probability"] <= 1.0
        assert 0 <= cat["score"] <= 100
        assert cat["level"] in ["Low", "Moderate", "Elevated"]
        assert len(cat["keyDrivers"]) > 0
        assert "model_name" in cat
        assert "model_version" in cat

    # 3. Explainability factors & recommendations
    assert len(result["explainableFactors"]) > 0
    for factor in result["explainableFactors"]:
        assert "feature" in factor
        assert "direction" in factor
        assert "explanation" in factor

    assert len(result["recommendations"]) > 0
    assert "clinicalDisclaimer" in result
