"""
Diabetes Preprocessing Pipeline for HealthGuard AI.

Handles Pima Indians Diabetes Database preprocessing:
- Zero-value replacement (biologically impossible zeros → NaN)
- Type validation
- Duplicate detection
- Invalid value checks
- sklearn Pipeline construction for leakage-free preprocessing

Dataset: Pima Indians Diabetes Database — 768 instances, 8 features
Source: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)
       https://archive.ics.uci.edu/dataset/34/diabetes
"""

import os
import logging
from typing import Tuple, List, Dict, Any

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

logger = logging.getLogger("healthguard.ml.preprocessing.diabetes")

# All 8 features in the Pima Indians Diabetes Dataset
DIABETES_FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

DIABETES_TARGET = "Outcome"

# Columns where zero is biologically impossible and represents missing data
ZERO_IS_MISSING_COLS = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]

# Clinically valid ranges
DIABETES_VALID_RANGES = {
    "Pregnancies": (0, 20),
    "Glucose": (30, 300),
    "BloodPressure": (20, 200),
    "SkinThickness": (5, 100),
    "Insulin": (10, 1000),
    "BMI": (10.0, 80.0),
    "DiabetesPedigreeFunction": (0.01, 5.0),
    "Age": (18, 120),
}


def load_diabetes_dataset(data_path: str) -> pd.DataFrame:
    """
    Loads the Pima Indians Diabetes CSV file.

    Args:
        data_path: Path to pima_diabetes.csv

    Returns:
        DataFrame with validated columns
    """
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Diabetes dataset not found at {data_path}. "
            f"Run: python ml/src/data/download_datasets.py"
        )

    df = pd.read_csv(data_path)
    logger.info(f"Loaded diabetes dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # Validate expected columns
    expected_cols = DIABETES_FEATURE_NAMES + [DIABETES_TARGET]
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns in diabetes dataset: {missing}")

    return df


def clean_diabetes_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans the Pima Indians diabetes dataset:
    1. Replace biologically impossible zeros with NaN
    2. Convert columns to proper numeric types
    3. Remove duplicates
    4. Validate feature ranges
    5. Report cleaning summary

    Args:
        df: Raw DataFrame from load_diabetes_dataset

    Returns:
        Tuple of (cleaned DataFrame, cleaning report dict)
    """
    report = {
        "original_rows": len(df),
        "zeros_replaced_with_nan": {},
        "duplicates_removed": 0,
        "invalid_values_clipped": 0,
    }

    df = df.copy()

    # 1. Convert all columns to numeric
    for col in DIABETES_FEATURE_NAMES + [DIABETES_TARGET]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # 2. Replace biologically impossible zeros with NaN
    for col in ZERO_IS_MISSING_COLS:
        if col in df.columns:
            zero_count = int((df[col] == 0).sum())
            if zero_count > 0:
                df.loc[df[col] == 0, col] = np.nan
                report["zeros_replaced_with_nan"][col] = zero_count
                logger.info(f"Replaced {zero_count} impossible zeros in '{col}' with NaN")

    # 3. Remove complete duplicates
    n_before = len(df)
    df = df.drop_duplicates()
    report["duplicates_removed"] = n_before - len(df)
    if report["duplicates_removed"] > 0:
        logger.info(f"Removed {report['duplicates_removed']} duplicate rows")

    # 4. Drop rows where the target is missing
    target_missing = df[DIABETES_TARGET].isnull().sum()
    if target_missing > 0:
        df = df.dropna(subset=[DIABETES_TARGET])
        logger.info(f"Dropped {target_missing} rows with missing target")

    # 5. Ensure target is integer binary
    df[DIABETES_TARGET] = df[DIABETES_TARGET].astype(int)

    # 6. Validate feature ranges (clip extreme outliers in non-NaN values)
    clipped = 0
    for col, (low, high) in DIABETES_VALID_RANGES.items():
        if col in df.columns:
            mask_valid = df[col].notna()
            out_of_range = ((df.loc[mask_valid, col] < low) | (df.loc[mask_valid, col] > high)).sum()
            if out_of_range > 0:
                df.loc[mask_valid, col] = df.loc[mask_valid, col].clip(lower=low, upper=high)
                clipped += out_of_range
    report["invalid_values_clipped"] = int(clipped)

    # Count total missing values after cleaning
    missing_counts = df[DIABETES_FEATURE_NAMES].isnull().sum()
    report["missing_values_after"] = {
        col: int(count) for col, count in missing_counts.items() if count > 0
    }

    report["final_rows"] = len(df)
    report["positive_rate"] = float(df[DIABETES_TARGET].mean())

    logger.info(
        f"Cleaning complete: {report['final_rows']} rows, "
        f"positive rate: {report['positive_rate']:.2%}"
    )

    return df, report


def build_diabetes_preprocessing_pipeline() -> Pipeline:
    """
    Builds a scikit-learn preprocessing pipeline for diabetes features.

    Steps:
    1. Median imputation for missing values (zeros were replaced with NaN)
    2. StandardScaler for numerical stability

    The pipeline is saved WITH the model so the exact same preprocessing
    is applied at training and inference time.
    """
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])


def split_diabetes_data(
    df: pd.DataFrame,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame,
           pd.Series, pd.Series, pd.Series]:
    """
    Splits the diabetes dataset into train/validation/test sets.

    Split: 60% train, 20% validation, 20% test (stratified)

    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    X = df[DIABETES_FEATURE_NAMES].copy()
    y = df[DIABETES_TARGET].copy()

    # First split: 80% train+val, 20% test
    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=random_state
    )

    # Second split: 75% of trainval = 60% total train, 25% of trainval = 20% total val
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval, test_size=0.25, stratify=y_trainval, random_state=random_state
    )

    logger.info(
        f"Data split — Train: {len(X_train)} ({y_train.mean():.2%} pos), "
        f"Val: {len(X_val)} ({y_val.mean():.2%} pos), "
        f"Test: {len(X_test)} ({y_test.mean():.2%} pos)"
    )

    return X_train, X_val, X_test, y_train, y_val, y_test
