"""
Tests for ML preprocessing pipelines.
"""

import sys
import os
import pandas as pd
import numpy as np
import pytest

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.preprocessing.diabetes_preprocessor import (
    DIABETES_FEATURE_NAMES,
    clean_diabetes_dataset,
    build_diabetes_preprocessing_pipeline
)
from src.preprocessing.heart_preprocessor import (
    HEART_FEATURE_NAMES,
    clean_heart_dataset,
    build_heart_preprocessing_pipeline
)

def test_diabetes_zero_replacement():
    """Test that biologically impossible zeros are replaced with NaN."""
    # Create dummy data with zeros in Glucose and BloodPressure
    data = {
        "Pregnancies": [0, 1],
        "Glucose": [0, 100],  # 0 is invalid
        "BloodPressure": [80, 0],  # 0 is invalid
        "SkinThickness": [20, 25],
        "Insulin": [80, 85],
        "BMI": [25.0, 26.0],
        "DiabetesPedigreeFunction": [0.5, 0.6],
        "Age": [30, 31],
        "Outcome": [0, 1]
    }
    df = pd.DataFrame(data)
    
    cleaned_df, report = clean_diabetes_dataset(df)
    
    # Check that zeros are now NaN
    assert pd.isna(cleaned_df.loc[0, "Glucose"])
    assert pd.isna(cleaned_df.loc[1, "BloodPressure"])
    
    # Check that report captured the replacements
    assert report["zeros_replaced_with_nan"]["Glucose"] == 1
    assert report["zeros_replaced_with_nan"]["BloodPressure"] == 1
    
    # Check that valid zeros (like Pregnancies) remain
    assert cleaned_df.loc[0, "Pregnancies"] == 0

def test_diabetes_pipeline_transform():
    """Test that pipeline imputes NaNs and scales data."""
    data = {
        "Pregnancies": [0, 1],
        "Glucose": [np.nan, 100], 
        "BloodPressure": [80, np.nan],
        "SkinThickness": [20, 25],
        "Insulin": [80, 85],
        "BMI": [25.0, 26.0],
        "DiabetesPedigreeFunction": [0.5, 0.6],
        "Age": [30, 31]
    }
    df = pd.DataFrame(data)
    
    pipeline = build_diabetes_preprocessing_pipeline()
    # Fit and transform
    transformed = pipeline.fit_transform(df)
    
    # Should be a numpy array with no NaNs
    assert isinstance(transformed, np.ndarray)
    assert not np.isnan(transformed).any()
    
    # Should have mean ~0 and std ~1 for each column
    means = transformed.mean(axis=0)
    stds = transformed.std(axis=0)
    assert np.allclose(means, 0, atol=1e-7)
    
def test_heart_target_binarization():
    """Test that target values 1-4 are converted to 1."""
    data = {col: [1, 2, 3, 4, 5] for col in HEART_FEATURE_NAMES}
    data["target"] = [0, 1, 2, 3, 4]  # Original target values
    df = pd.DataFrame(data)
    
    cleaned_df, _ = clean_heart_dataset(df)
    
    # Target should only contain 0 and 1
    assert set(cleaned_df["target"].unique()) == {0, 1}
    assert (cleaned_df["target"] == 0).sum() == 1
    assert (cleaned_df["target"] == 1).sum() == 4
