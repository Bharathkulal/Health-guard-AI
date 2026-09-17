"""
Heart Disease Preprocessing Pipeline for HealthGuard AI.

Handles UCI Heart Disease (Cleveland) dataset preprocessing:
- Missing value handling ('?' markers → NaN)
- Type conversion
- Duplicate detection
- Invalid value checks
- Target binarization (0 vs 1-4 → 0/1)
- sklearn Pipeline construction for leakage-free preprocessing

Dataset: UCI Heart Disease (Cleveland) — 303 instances, 13 features
Source: https://archive.ics.uci.edu/dataset/45/heart+disease
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

logger = logging.getLogger("healthguard.ml.preprocessing.heart")

# All 13 features in the UCI Cleveland dataset
HEART_FEATURE_NAMES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

HEART_TARGET = "target"

# Clinically valid ranges for each feature
HEART_VALID_RANGES = {
    "age": (18, 120),
    "sex": (0, 1),
    "cp": (1, 4),
    "trestbps": (60, 300),
    "chol": (50, 700),
    "fbs": (0, 1),
    "restecg": (0, 2),
    "thalach": (50, 250),
    "exang": (0, 1),
    "oldpeak": (-2.0, 10.0),
    "slope": (1, 3),
    "ca": (0, 4),
    "thal": (3, 7),
}


def load_heart_dataset(data_path: str) -> pd.DataFrame:
    """
    Loads the UCI Heart Disease (Cleveland) CSV file.

    Args:
        data_path: Path to heart_disease_cleveland.csv

    Returns:
        DataFrame with validated columns and types
    """
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Heart disease dataset not found at {data_path}. "
            f"Run: python ml/src/data/download_datasets.py"
        )

    df = pd.read_csv(data_path, na_values=["?", "NA", ""])
    logger.info(f"Loaded heart disease dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # Validate expected columns
    expected_cols = HEART_FEATURE_NAMES + [HEART_TARGET]
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns in heart dataset: {missing}")

    return df


def clean_heart_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans the heart disease dataset:
    1. Replace '?' with NaN (already done by pd.read_csv na_values)
    2. Convert columns to numeric types
    3. Binarize target (0 = no disease, 1-4 → 1 = disease present)
    4. Remove duplicates
    5. Validate feature ranges
    6. Report cleaning summary

    Args:
        df: Raw DataFrame from load_heart_dataset

    Returns:
        Tuple of (cleaned DataFrame, cleaning report dict)
    """
    report = {
        "original_rows": len(df),
        "missing_values_before": {},
        "duplicates_removed": 0,
        "invalid_values_clipped": 0,
    }

    df = df.copy()

    # 1. Convert all feature columns to numeric (handle any remaining string values)
    for col in HEART_FEATURE_NAMES + [HEART_TARGET]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # 2. Count missing values per column
    missing_counts = df[HEART_FEATURE_NAMES].isnull().sum()
    report["missing_values_before"] = {
        col: int(count) for col, count in missing_counts.items() if count > 0
    }
    total_missing = int(missing_counts.sum())
    if total_missing > 0:
        logger.info(f"Missing values detected: {report['missing_values_before']}")

    # 3. Binarize target: 0 stays 0, values 1-4 become 1
    if HEART_TARGET in df.columns:
        df[HEART_TARGET] = (df[HEART_TARGET] >= 1).astype(int)
        logger.info(
            f"Target binarized: {(df[HEART_TARGET] == 0).sum()} negative, "
            f"{(df[HEART_TARGET] == 1).sum()} positive"
        )

    # 4. Remove complete duplicates
    n_before = len(df)
    df = df.drop_duplicates()
    report["duplicates_removed"] = n_before - len(df)
    if report["duplicates_removed"] > 0:
        logger.info(f"Removed {report['duplicates_removed']} duplicate rows")

    # 5. Drop rows where the target is missing
    target_missing = df[HEART_TARGET].isnull().sum()
    if target_missing > 0:
        df = df.dropna(subset=[HEART_TARGET])
        logger.info(f"Dropped {target_missing} rows with missing target")

    # 6. Validate feature ranges (clip extreme outliers)
    clipped = 0
    for col, (low, high) in HEART_VALID_RANGES.items():
        if col in df.columns:
            mask_valid = df[col].notna()
            out_of_range = ((df.loc[mask_valid, col] < low) | (df.loc[mask_valid, col] > high)).sum()
            if out_of_range > 0:
                df.loc[mask_valid, col] = df.loc[mask_valid, col].clip(lower=low, upper=high)
                clipped += out_of_range
    report["invalid_values_clipped"] = int(clipped)

    report["final_rows"] = len(df)
    report["positive_rate"] = float(df[HEART_TARGET].mean())

    logger.info(
        f"Cleaning complete: {report['final_rows']} rows, "
        f"positive rate: {report['positive_rate']:.2%}"
    )

    return df, report


def build_heart_preprocessing_pipeline() -> Pipeline:
    """
    Builds a scikit-learn preprocessing pipeline for heart disease features.

    Steps:
    1. Median imputation for missing values (ca, thal columns have NaN)
    2. StandardScaler for numerical stability

    The pipeline is saved WITH the model so the exact same preprocessing
    is applied at training and inference time.
    """
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])


def split_heart_data(
    df: pd.DataFrame,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame,
           pd.Series, pd.Series, pd.Series]:
    """
    Splits the heart disease dataset into train/validation/test sets.

    Split: 60% train, 20% validation, 20% test (stratified)

    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    X = df[HEART_FEATURE_NAMES].copy()
    y = df[HEART_TARGET].copy()

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
