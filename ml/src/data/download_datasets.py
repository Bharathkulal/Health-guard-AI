"""
Dataset Download Script for HealthGuard AI.

Downloads the two approved public datasets:
1. UCI Heart Disease (Cleveland) — 303 instances, 13 features
2. Pima Indians Diabetes Database — 768 instances, 8 features

Both datasets are from the UCI Machine Learning Repository.
Usage: python -m ml.src.data.download_datasets
"""

import os
import sys
import logging
import urllib.request
import csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(message)s")
logger = logging.getLogger("healthguard.data.download")

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DATA_DIR = os.path.join(ML_ROOT, "data", "raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

# UCI Heart Disease (Cleveland) - processed.cleveland.data
HEART_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
HEART_FILENAME = "heart_disease_cleveland.csv"
HEART_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"
]

# Pima Indians Diabetes Database
PIMA_URL = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"
PIMA_FILENAME = "pima_diabetes.csv"
PIMA_COLUMNS = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
]


def download_file(url: str, dest_path: str, description: str) -> bool:
    """Downloads a file from a URL to a local path."""
    if os.path.exists(dest_path):
        logger.info(f"[SKIP] {description} already exists at {dest_path}")
        return True

    logger.info(f"[DOWNLOAD] {description} from {url}")
    try:
        urllib.request.urlretrieve(url, dest_path)
        file_size = os.path.getsize(dest_path)
        logger.info(f"[OK] Downloaded {description} ({file_size:,} bytes) → {dest_path}")
        return True
    except Exception as exc:
        logger.error(f"[FAIL] Failed to download {description}: {exc}")
        return False


def process_heart_data(raw_path: str, output_path: str) -> bool:
    """
    Processes the UCI Cleveland heart disease data:
    - Adds column headers (the raw file has no header row)
    - Handles '?' missing value markers
    - Saves as proper CSV with headers
    """
    logger.info(f"Processing heart disease data: {raw_path} → {output_path}")
    try:
        rows = []
        with open(raw_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                values = [v.strip() for v in line.split(",")]
                if len(values) == len(HEART_COLUMNS):
                    rows.append(values)

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEART_COLUMNS)
            writer.writerows(rows)

        logger.info(f"[OK] Heart disease dataset: {len(rows)} records, {len(HEART_COLUMNS)} columns")
        return True
    except Exception as exc:
        logger.error(f"[FAIL] Error processing heart data: {exc}")
        return False


def process_pima_data(raw_path: str, output_path: str) -> bool:
    """
    Processes the Pima Indians Diabetes data:
    - Adds column headers (the raw file has no header row)
    - Saves as proper CSV with headers
    """
    logger.info(f"Processing Pima diabetes data: {raw_path} → {output_path}")
    try:
        rows = []
        with open(raw_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                values = [v.strip() for v in line.split(",")]
                if len(values) == len(PIMA_COLUMNS):
                    rows.append(values)

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(PIMA_COLUMNS)
            writer.writerows(rows)

        logger.info(f"[OK] Pima diabetes dataset: {len(rows)} records, {len(PIMA_COLUMNS)} columns")
        return True
    except Exception as exc:
        logger.error(f"[FAIL] Error processing Pima data: {exc}")
        return False


def download_all_datasets():
    """Downloads and processes all required datasets."""
    logger.info("=" * 60)
    logger.info("HealthGuard AI — Dataset Download & Preparation")
    logger.info("=" * 60)

    # 1. Heart Disease (Cleveland)
    heart_raw = os.path.join(RAW_DATA_DIR, "processed.cleveland.data")
    heart_final = os.path.join(RAW_DATA_DIR, HEART_FILENAME)

    if not os.path.exists(heart_final):
        if download_file(HEART_URL, heart_raw, "UCI Heart Disease (Cleveland)"):
            process_heart_data(heart_raw, heart_final)
            # Clean up raw intermediate file
            if os.path.exists(heart_raw) and os.path.exists(heart_final):
                os.remove(heart_raw)
    else:
        logger.info(f"[SKIP] Heart disease dataset already present: {heart_final}")

    # 2. Pima Indians Diabetes
    pima_raw = os.path.join(RAW_DATA_DIR, "pima-indians-diabetes.data.csv")
    pima_final = os.path.join(RAW_DATA_DIR, PIMA_FILENAME)

    if not os.path.exists(pima_final):
        if download_file(PIMA_URL, pima_raw, "Pima Indians Diabetes"):
            process_pima_data(pima_raw, pima_final)
            # Clean up raw intermediate file
            if os.path.exists(pima_raw) and os.path.exists(pima_final):
                os.remove(pima_raw)
    else:
        logger.info(f"[SKIP] Pima diabetes dataset already present: {pima_final}")

    # Verify
    logger.info("")
    logger.info("Dataset Status:")
    for name, path in [("Heart Disease", heart_final), ("Pima Diabetes", pima_final)]:
        if os.path.exists(path):
            size = os.path.getsize(path)
            logger.info(f"  ✓ {name}: {path} ({size:,} bytes)")
        else:
            logger.error(f"  ✗ {name}: NOT FOUND at {path}")

    logger.info("=" * 60)


if __name__ == "__main__":
    download_all_datasets()
