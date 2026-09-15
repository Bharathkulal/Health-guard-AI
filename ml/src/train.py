import sys
import os

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.pipeline import Pipeline

from src.data_loader import (
    load_diabetes_dataset,
    load_cardiovascular_dataset,
    load_hypertension_dataset,
)
from src.features import (
    DIABETES_FEATURES,
    CARDIOVASCULAR_FEATURES,
    HYPERTENSION_FEATURES,
)
from src.preprocessing import build_preprocessor
from src.evaluate import evaluate_binary_classifier, extract_feature_importances

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(message)s")
logger = logging.getLogger("healthguard.ml.train")

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "reports"))

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def get_candidate_models(random_state: int = 42) -> Dict[str, Any]:
    """Returns candidate classification algorithms to benchmark."""
    return {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            C=1.0,
            random_state=random_state,
        ),
        "DecisionTree": DecisionTreeClassifier(
            max_depth=6,
            min_samples_leaf=10,
            class_weight="balanced",
            random_state=random_state,
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            random_state=random_state,
        ),
    }


def train_condition_pipeline(
    condition_name: str,
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str,
    version: str = "1.0",
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Trains, validates, compares, and exports the optimal model pipeline for a given health condition.
    """
    logger.info(f"=== Starting Model Training Pipeline for: {condition_name.upper()} ===")
    logger.info(f"Dataset Size: {df.shape[0]} rows, {len(feature_cols)} features. Target: '{target_col}'")

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Stratified Train/Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=random_state
    )

    logger.info(f"Train samples: {len(X_train)} (Positive rate: {y_train.mean():.2%}), Test samples: {len(X_test)} (Positive rate: {y_test.mean():.2%})")

    candidate_models = get_candidate_models(random_state=random_state)
    comparison_results = {}
    fitted_pipelines = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)

    for model_name, model_estimator in candidate_models.items():
        logger.info(f"Evaluating {model_name} on 5-fold Stratified Cross-Validation...")
        pipeline = Pipeline([
            ("preprocessor", build_preprocessor(feature_cols)),
            ("classifier", model_estimator),
        ])

        # Perform 5-fold cross validation on training set only
        cv_scores = cross_validate(
            pipeline,
            X_train,
            y_train,
            cv=cv,
            scoring=["accuracy", "recall", "precision", "f1", "roc_auc"],
            n_jobs=-1,
        )

        # Fit on full training set
        pipeline.fit(X_train, y_train)
        fitted_pipelines[model_name] = pipeline

        # Predict on holdout test set
        y_test_pred = pipeline.predict(X_test)
        if hasattr(pipeline, "predict_proba"):
            y_test_prob = pipeline.predict_proba(X_test)[:, 1]
        elif hasattr(pipeline, "decision_function"):
            y_test_prob = pipeline.decision_function(X_test)
        else:
            y_test_prob = y_test_pred.astype(float)

        test_metrics = evaluate_binary_classifier(y_test, y_test_pred, y_test_prob)

        # Composite score weighting Recall (40%), ROC-AUC (30%), F1 (30%)
        clinical_selection_score = (
            0.40 * test_metrics["recall"]
            + 0.30 * test_metrics["roc_auc"]
            + 0.30 * test_metrics["f1"]
        )

        comparison_results[model_name] = {
            "cv_metrics_mean": {
                "accuracy": round(float(np.mean(cv_scores["test_accuracy"])), 4),
                "recall": round(float(np.mean(cv_scores["test_recall"])), 4),
                "precision": round(float(np.mean(cv_scores["test_precision"])), 4),
                "f1": round(float(np.mean(cv_scores["test_f1"])), 4),
                "roc_auc": round(float(np.mean(cv_scores["test_roc_auc"])), 4),
            },
            "test_metrics": test_metrics,
            "clinical_selection_score": round(float(clinical_selection_score), 4),
        }

        logger.info(
            f"  -> {model_name} Test Performance: Accuracy={test_metrics['accuracy']:.4f}, "
            f"Recall={test_metrics['recall']:.4f}, Precision={test_metrics['precision']:.4f}, "
            f"ROC-AUC={test_metrics['roc_auc']:.4f}, Selection Score={clinical_selection_score:.4f}"
        )

    # Select Best Model based on highest Clinical Selection Score
    best_model_name = max(
        comparison_results.keys(),
        key=lambda m: comparison_results[m]["clinical_selection_score"]
    )
    best_pipeline = fitted_pipelines[best_model_name]
    best_test_metrics = comparison_results[best_model_name]["test_metrics"]

    logger.info(f"*** Selected Optimal Model for {condition_name}: '{best_model_name}' ***")

    # Extract Feature Importances
    feature_importances = extract_feature_importances(
        best_pipeline.named_steps["classifier"],
        feature_cols
    )

    # Save Pipeline to Disk
    pipeline_filename = f"{condition_name}_pipeline.joblib"
    pipeline_path = os.path.join(MODELS_DIR, pipeline_filename)
    joblib.dump(best_pipeline, pipeline_path)
    logger.info(f"Saved trained pipeline to {pipeline_path}")

    # Save Metadata JSON
    metadata = {
        "condition": condition_name,
        "model_name": best_model_name,
        "version": version,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "dataset_sample_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "positive_class_prevalence": round(float(y.mean()), 4),
        "features": feature_cols,
        "feature_importances": feature_importances,
        "test_metrics": best_test_metrics,
        "cv_metrics": comparison_results[best_model_name]["cv_metrics_mean"],
        "pipeline_file": pipeline_filename,
    }

    metadata_path = os.path.join(MODELS_DIR, f"{condition_name}_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model metadata to {metadata_path}")

    return {
        "condition": condition_name,
        "selected_model": best_model_name,
        "metadata": metadata,
        "all_comparisons": comparison_results,
    }


def run_full_training_suite():
    """Executes the complete multi-condition model training and comparison suite."""
    logger.info("Initializing HealthGuard AI Complete ML Training Pipeline...")

    # 1. Diabetes
    df_diabetes = load_diabetes_dataset(sample_size=16000, random_seed=42)
    res_diabetes = train_condition_pipeline(
        condition_name="diabetes",
        df=df_diabetes,
        feature_cols=DIABETES_FEATURES,
        target_col="diabetes",
        version="1.0",
        random_state=42,
    )

    # 2. Cardiovascular Disease
    df_cardio = load_cardiovascular_dataset(sample_size=16000, random_seed=42)
    res_cardio = train_condition_pipeline(
        condition_name="cardiovascular",
        df=df_cardio,
        feature_cols=CARDIOVASCULAR_FEATURES,
        target_col="cardio",
        version="1.0",
        random_state=42,
    )

    # 3. Hypertension
    df_htn = load_hypertension_dataset(sample_size=16000, random_seed=42)
    res_htn = train_condition_pipeline(
        condition_name="hypertension",
        df=df_htn,
        feature_cols=HYPERTENSION_FEATURES,
        target_col="hypertension",
        version="1.0",
        random_state=42,
    )

    # Compile Reports
    full_comparison_report = {
        "diabetes": res_diabetes["all_comparisons"],
        "cardiovascular": res_cardio["all_comparisons"],
        "hypertension": res_htn["all_comparisons"],
    }
    with open(os.path.join(REPORTS_DIR, "model_comparison.json"), "w", encoding="utf-8") as f:
        json.dump(full_comparison_report, f, indent=2)

    evaluation_summary = {
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "models": {
            "diabetes": res_diabetes["metadata"],
            "cardiovascular": res_cardio["metadata"],
            "hypertension": res_htn["metadata"],
        }
    }
    with open(os.path.join(REPORTS_DIR, "evaluation_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(evaluation_summary, f, indent=2)

    logger.info(f"Full ML Training Suite Complete. Reports saved to {REPORTS_DIR}")
    return evaluation_summary


if __name__ == "__main__":
    summary = run_full_training_suite()
    print("\n================ ML TRAINING SUITE SUMMARY ================")
    for cond, meta in summary["models"].items():
        print(f"\nCondition: {cond.upper()}")
        print(f"  Best Model: {meta['model_name']} (v{meta['version']})")
        print(f"  Test Accuracy:  {meta['test_metrics']['accuracy']:.2%}")
        print(f"  Test Recall:    {meta['test_metrics']['recall']:.2%}")
        print(f"  Test Precision: {meta['test_metrics']['precision']:.2%}")
        print(f"  Test ROC-AUC:   {meta['test_metrics']['roc_auc']:.4f}")
        print("  Top Contributing Features:", ", ".join([f"{f['feature']} ({f['importance']:.1%})" for f in meta['feature_importances'][:3]]))
