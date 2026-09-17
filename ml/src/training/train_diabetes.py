"""
Diabetes Model Training Script for HealthGuard AI.

Trains and compares Logistic Regression and Random Forest classifiers on
the Pima Indians Diabetes Database. Selects the best model using a
screening-oriented composite metric, evaluates on held-out test set,
and saves the complete pipeline.

Dataset: Pima Indians Diabetes Database — 768 instances, 8 features
Source: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)
        https://archive.ics.uci.edu/dataset/34/diabetes

Usage:
    python ml/src/training/train_diabetes.py

Outputs:
    ml/models/diabetes_model.joblib          — Complete preprocessing + classifier pipeline
    ml/reports/diabetes_metrics.json         — Evaluation metrics (actual, not hardcoded)
    ml/reports/confusion_matrices/diabetes_confusion_matrix.png — Confusion matrix plot
"""

import sys
import os
import json
import logging
from datetime import datetime, timezone

import numpy as np
import sklearn
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

# Setup paths
ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from src.preprocessing.diabetes_preprocessor import (
    load_diabetes_dataset,
    clean_diabetes_dataset,
    build_diabetes_preprocessing_pipeline,
    split_diabetes_data,
    DIABETES_FEATURE_NAMES,
    DIABETES_TARGET,
)
from src.evaluation.evaluator import (
    evaluate_binary_classifier,
    compute_selection_score,
    plot_confusion_matrix,
    extract_feature_importances,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(message)s")
logger = logging.getLogger("healthguard.ml.training.diabetes")

MODELS_DIR = os.path.join(ML_ROOT, "models")
REPORTS_DIR = os.path.join(ML_ROOT, "reports")
CONFUSION_DIR = os.path.join(REPORTS_DIR, "confusion_matrices")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(CONFUSION_DIR, exist_ok=True)

RANDOM_STATE = 42


def get_candidate_models():
    """Returns the candidate classifiers to compare."""
    return {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            C=1.0,
            solver="lbfgs",
            random_state=RANDOM_STATE,
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


def train_diabetes_model():
    """
    Complete diabetes model training pipeline:
    1. Load dataset
    2. Validate & clean (zero→NaN replacement)
    3. Split data (60/20/20)
    4. Train LR and RF
    5. Evaluate on validation set
    6. Select best model
    7. Final evaluation on test set
    8. Save pipeline + metrics
    """
    logger.info("=" * 70)
    logger.info("  DIABETES MODEL TRAINING PIPELINE")
    logger.info("  Dataset: Pima Indians Diabetes Database")
    logger.info("=" * 70)

    # 1. Load dataset
    data_path = os.path.join(ML_ROOT, "data", "raw", "pima_diabetes.csv")
    df = load_diabetes_dataset(data_path)

    # 2. Clean dataset
    df, cleaning_report = clean_diabetes_dataset(df)
    logger.info(f"Cleaning report: {json.dumps(cleaning_report, indent=2)}")

    # 3. Split data
    X_train, X_val, X_test, y_train, y_val, y_test = split_diabetes_data(df, random_state=RANDOM_STATE)

    # 4-5. Train and evaluate candidates on VALIDATION set
    candidate_models = get_candidate_models()
    comparison_results = {}
    fitted_pipelines = {}

    for model_name, classifier in candidate_models.items():
        logger.info(f"\n--- Training {model_name} ---")

        # Build full pipeline: preprocessing + classifier
        pipeline = Pipeline([
            ("preprocessor", build_diabetes_preprocessing_pipeline()),
            ("classifier", classifier),
        ])

        # Fit on training data only
        pipeline.fit(X_train, y_train)
        fitted_pipelines[model_name] = pipeline

        # Evaluate on VALIDATION set (not test!)
        y_val_pred = pipeline.predict(X_val)
        y_val_prob = pipeline.predict_proba(X_val)[:, 1]
        val_metrics = evaluate_binary_classifier(y_val, y_val_pred, y_val_prob)
        selection_score = compute_selection_score(val_metrics)

        comparison_results[model_name] = {
            "validation_metrics": val_metrics,
            "selection_score": selection_score,
        }

        logger.info(
            f"  {model_name} Validation → "
            f"Acc={val_metrics['accuracy']:.4f}, "
            f"Recall={val_metrics['recall']:.4f}, "
            f"Prec={val_metrics['precision']:.4f}, "
            f"F1={val_metrics['f1']:.4f}, "
            f"AUC={val_metrics['roc_auc']:.4f}, "
            f"Selection={selection_score:.4f}"
        )

    # 6. Select best model based on validation selection score
    best_model_name = max(
        comparison_results.keys(),
        key=lambda m: comparison_results[m]["selection_score"]
    )
    best_pipeline = fitted_pipelines[best_model_name]
    logger.info(f"\n*** Selected Model: {best_model_name} ***")
    logger.info(f"    Selection Score: {comparison_results[best_model_name]['selection_score']:.4f}")
    logger.info(f"    Strategy: 0.40*Recall + 0.30*ROC-AUC + 0.30*F1 (screening-oriented)")

    # 7. Final evaluation on HELD-OUT TEST SET (done only once)
    logger.info(f"\n--- Final Test Set Evaluation ({best_model_name}) ---")
    y_test_pred = best_pipeline.predict(X_test)
    y_test_prob = best_pipeline.predict_proba(X_test)[:, 1]
    test_metrics = evaluate_binary_classifier(y_test, y_test_pred, y_test_prob)

    logger.info(
        f"  TEST → Acc={test_metrics['accuracy']:.4f}, "
        f"Recall={test_metrics['recall']:.4f}, "
        f"Prec={test_metrics['precision']:.4f}, "
        f"F1={test_metrics['f1']:.4f}, "
        f"AUC={test_metrics['roc_auc']:.4f}"
    )

    # Extract feature importances
    feature_importances = extract_feature_importances(
        best_pipeline.named_steps["classifier"],
        DIABETES_FEATURE_NAMES,
    )

    # 8a. Save confusion matrix plot
    cm_path = os.path.join(CONFUSION_DIR, "diabetes_confusion_matrix.png")
    plot_confusion_matrix(
        y_test, y_test_pred,
        title=f"Diabetes — {best_model_name} (Test Set)",
        save_path=cm_path,
        labels=["No Diabetes", "Diabetes"],
    )

    # 8b. Save complete pipeline
    pipeline_path = os.path.join(MODELS_DIR, "diabetes_model.joblib")
    joblib.dump(best_pipeline, pipeline_path)
    logger.info(f"Saved trained pipeline: {pipeline_path}")

    # 8c. Save metrics report
    metrics_report = {
        "model_name": best_model_name,
        "dataset": "Pima Indians Diabetes Database",
        "dataset_url": "https://archive.ics.uci.edu/dataset/34/diabetes",
        "dataset_size": len(df),
        "train_size": len(X_train),
        "validation_size": len(X_val),
        "test_size": len(X_test),
        "positive_class_prevalence": round(float(df[DIABETES_TARGET].mean()), 4),
        "feature_names": DIABETES_FEATURE_NAMES,
        "target_definition": "Tested positive for diabetes (binary: 0=negative, 1=positive)",
        "preprocessing_description": "Zero-value replacement with NaN for impossible values (Glucose, BP, SkinThickness, Insulin, BMI), median imputation, StandardScaler",
        "selection_strategy": "Composite: 0.40*Recall + 0.30*ROC-AUC + 0.30*F1 (screening-oriented)",
        "training_date": datetime.now(timezone.utc).isoformat(),
        "sklearn_version": sklearn.__version__,
        "random_state": RANDOM_STATE,
        "test_metrics": test_metrics,
        "feature_importances": feature_importances,
        "model_comparison": {
            name: {
                "validation_metrics": result["validation_metrics"],
                "selection_score": result["selection_score"],
            }
            for name, result in comparison_results.items()
        },
        "cleaning_report": cleaning_report,
        "pipeline_file": "diabetes_model.joblib",
        "population_note": "Pima Indian females aged >= 21. Model may not generalize to other populations.",
    }

    metrics_path = os.path.join(REPORTS_DIR, "diabetes_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    logger.info(f"Saved metrics report: {metrics_path}")

    # Print concise summary
    logger.info("\n" + "=" * 70)
    logger.info("  DIABETES TRAINING SUMMARY")
    logger.info("=" * 70)
    logger.info(f"  Dataset:           Pima Indians Diabetes Database")
    logger.info(f"  Records:           {len(df)}")
    logger.info(f"  Features:          {len(DIABETES_FEATURE_NAMES)}")
    logger.info(f"  Selected Model:    {best_model_name}")
    logger.info(f"  Test Accuracy:     {test_metrics['accuracy']:.2%}")
    logger.info(f"  Test Recall:       {test_metrics['recall']:.2%}")
    logger.info(f"  Test Precision:    {test_metrics['precision']:.2%}")
    logger.info(f"  Test F1:           {test_metrics['f1']:.4f}")
    logger.info(f"  Test ROC-AUC:      {test_metrics['roc_auc']:.4f}")
    top_feats = ', '.join(f'{fi["feature"]} ({fi["importance"]:.1%})' for fi in feature_importances[:3])
    logger.info(f"  Top Features:      {top_feats}")
    logger.info(f"  Pipeline:          {pipeline_path}")
    logger.info(f"  Metrics:           {metrics_path}")
    logger.info(f"  Confusion Matrix:  {cm_path}")
    logger.info("=" * 70)

    return metrics_report


if __name__ == "__main__":
    train_diabetes_model()
