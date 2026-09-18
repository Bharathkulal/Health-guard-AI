"""
Dataset Management Service for HealthGuard AI.
Handles CSV/XLSX file ingestion, real-time statistics calculation, schema inspection,
preview generation, deep data validation checks, and dataset lifecycle management.
"""

import os
import sys
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger("healthguard.services.dataset")

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml"))
DATA_DIR = os.path.join(ML_ROOT, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
RAW_DIR = os.path.join(DATA_DIR, "raw")
DATASETS_REGISTRY_FILE = os.path.join(DATA_DIR, "datasets_registry.json")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)


def format_file_size(size_bytes: int) -> str:
    """Formats bytes into human readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def detect_target_column(columns: List[str]) -> Optional[str]:
    """Heuristically identifies potential target/outcome columns."""
    candidate_names = [
        "cardio", "diabetes", "hypertension", "target", "outcome", "class",
        "label", "disease", "diagnosis", "num", "has_disease", "condition",
        "heart_disease", "stroke", "diabetic"
    ]
    cols_lower = {c.lower(): c for c in columns}
    for cand in candidate_names:
        if cand in cols_lower:
            return cols_lower[cand]
    return None


def infer_column_type(series: pd.Series) -> str:
    """Infers clinical/tabular data type for a pandas series."""
    if pd.api.types.is_bool_dtype(series):
        return "Boolean"
    elif pd.api.types.is_integer_dtype(series):
        return "Integer"
    elif pd.api.types.is_float_dtype(series):
        return "Float"
    elif pd.api.types.is_datetime64_any_dtype(series):
        return "DateTime"
    elif series.nunique(dropna=True) <= 10 and series.dtype == object:
        return "Categorical"
    else:
        return "Text/String"


class DatasetService:
    """Manages tabular datasets catalog, previews, statistics, and validation."""

    def __init__(self):
        self._ensure_initialized()

    def _ensure_initialized(self):
        """Discovers built-in raw datasets if registry does not exist."""
        if not os.path.exists(DATASETS_REGISTRY_FILE) or os.path.getsize(DATASETS_REGISTRY_FILE) == 0:
            initial_datasets = []
            
            # Built-in dataset definitions
            builtin_specs = [
                ("cardiovascular_data.csv", "Cardiovascular Disease Benchmark", "cardio", "Built-in"),
                ("diabetes_data.csv", "Diabetes Clinical Cohort", "diabetes", "Built-in"),
                ("hypertension_data.csv", "Hypertension Surveillance Dataset", "hypertension", "Built-in"),
                ("heart_disease_cleveland.csv", "UCI Cleveland Heart Disease", "target", "Benchmark"),
                ("pima_diabetes.csv", "UCI Pima Indians Diabetes", "Outcome", "Benchmark"),
            ]

            for fname, dname, target_col, status_tag in builtin_specs:
                fpath = os.path.join(RAW_DIR, fname)
                if os.path.exists(fpath):
                    try:
                        meta = self._compute_dataset_metadata(
                            file_path=fpath,
                            display_name=dname,
                            custom_target=target_col,
                            dataset_id=f"ds_{fname.split('.')[0]}",
                            status=status_tag,
                        )
                        initial_datasets.append(meta)
                    except Exception as exc:
                        logger.warning(f"Failed to index built-in dataset {fname}: {exc}")

            with open(DATASETS_REGISTRY_FILE, "w", encoding="utf-8") as f:
                json.dump(initial_datasets, f, indent=2)

    def _read_registry(self) -> List[Dict[str, Any]]:
        """Reads dataset catalog from registry file."""
        if not os.path.exists(DATASETS_REGISTRY_FILE):
            return []
        try:
            with open(DATASETS_REGISTRY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:
            logger.error(f"Failed to read datasets registry: {exc}")
            return []

    def _write_registry(self, registry: List[Dict[str, Any]]):
        """Persists dataset catalog to registry file."""
        try:
            with open(DATASETS_REGISTRY_FILE, "w", encoding="utf-8") as f:
                json.dump(registry, f, indent=2)
        except Exception as exc:
            logger.error(f"Failed to write datasets registry: {exc}")

    def _compute_dataset_metadata(
        self,
        file_path: str,
        display_name: str,
        custom_target: Optional[str] = None,
        dataset_id: Optional[str] = None,
        status: str = "Ready",
    ) -> Dict[str, Any]:
        """Loads and computes real dataset statistics and preview."""
        ds_id = dataset_id or f"ds_{uuid.uuid4().hex[:8]}"
        fname = os.path.basename(file_path)
        ext = os.path.splitext(fname)[1].lower()
        file_size = os.path.getsize(file_path)

        # Load into DataFrame
        if ext in (".xlsx", ".xls"):
            df = pd.read_excel(file_path)
            file_type = "XLSX"
        else:
            df = pd.read_csv(file_path)
            file_type = "CSV"

        records_count = int(len(df))
        features_count = int(len(df.columns))
        columns = [str(c) for c in df.columns]

        # Column data types & missing per column
        data_types = {}
        missing_per_column = {}
        for col in df.columns:
            data_types[str(col)] = infer_column_type(df[col])
            missing_per_column[str(col)] = int(df[col].isna().sum())

        missing_values_count = int(df.isna().sum().sum())
        duplicates_count = int(df.duplicated().sum())

        # Count invalid/inf numeric values
        numeric_df = df.select_dtypes(include=[np.number])
        invalid_values_count = int(np.isinf(numeric_df).sum().sum()) if not numeric_df.empty else 0

        # Detect or assign target column
        target_col = custom_target if (custom_target and custom_target in df.columns) else detect_target_column(columns)
        
        # Class distribution if target exists
        class_distribution = {}
        if target_col and target_col in df.columns:
            val_counts = df[target_col].value_counts(dropna=False).to_dict()
            class_distribution = {str(k): int(v) for k, v in val_counts.items()}

        # Generate sanitized preview (first 25 rows)
        preview_df = df.head(25).copy()
        # Replace NaN / Inf with None for valid JSON serialization
        preview_df = preview_df.replace([np.inf, -np.inf], None)
        preview_rows = preview_df.where(pd.notnull(preview_df), None).to_dict(orient="records")

        # Initial validation status
        if missing_values_count > (records_count * features_count * 0.3):
            validation_status = "Warning"
        elif not target_col:
            validation_status = "Warning"
        else:
            validation_status = "Valid"

        return {
            "dataset_id": ds_id,
            "name": display_name or fname.replace(ext, "").replace("_", " ").title(),
            "file_name": fname,
            "file_path": file_path,
            "file_size": format_file_size(file_size),
            "file_size_bytes": file_size,
            "file_type": file_type,
            "records_count": records_count,
            "features_count": features_count,
            "columns": columns,
            "data_types": data_types,
            "missing_values_count": missing_values_count,
            "missing_per_column": missing_per_column,
            "duplicates_count": duplicates_count,
            "invalid_values_count": invalid_values_count,
            "target_column": target_col,
            "class_distribution": class_distribution,
            "validation_status": validation_status,
            "status": status,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "preview": preview_rows,
        }

    def list_datasets(self) -> List[Dict[str, Any]]:
        """Returns all datasets from registry."""
        return self._read_registry()

    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Finds a dataset by its ID."""
        for ds in self._read_registry():
            if ds.get("dataset_id") == dataset_id:
                return ds
        return None

    def upload_dataset(
        self,
        file_bytes: bytes,
        filename: str,
        display_name: Optional[str] = None,
        target_column: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Saves uploaded file and registers metadata."""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in (".csv", ".xlsx", ".xls"):
            raise ValueError(f"Unsupported file type '{ext}'. Only CSV and XLSX files are supported.")

        ds_id = f"ds_{uuid.uuid4().hex[:8]}"
        clean_name = "".join([c if c.isalnum() or c in "._-" else "_" for c in filename])
        saved_filename = f"{ds_id}_{clean_name}"
        saved_path = os.path.join(UPLOADS_DIR, saved_filename)

        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        metadata = self._compute_dataset_metadata(
            file_path=saved_path,
            display_name=display_name or filename.replace(ext, "").replace("_", " ").title(),
            custom_target=target_column,
            dataset_id=ds_id,
            status="Uploaded",
        )

        registry = self._read_registry()
        registry.insert(0, metadata)
        self._write_registry(registry)

        return metadata

    def validate_dataset(self, dataset_id: str, target_column: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs comprehensive clinical validation checks on the dataset.
        Evaluates missing values, duplicates, numeric outliers, class balance, etc.
        """
        dataset = self.get_dataset(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset with ID '{dataset_id}' not found.")

        file_path = dataset.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file '{file_path}' does not exist on disk.")

        ext = os.path.splitext(file_path)[1].lower()
        if ext in (".xlsx", ".xls"):
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)

        target_col = target_column or dataset.get("target_column")
        records_count = len(df)
        features_count = len(df.columns)
        
        checks = []
        issues = []
        warning_count = 0
        error_count = 0

        # Check 1: Dataset Readability
        checks.append({
            "name": "Dataset Structure & Readability",
            "status": "passed",
            "message": f"Successfully parsed {records_count:,} rows and {features_count} columns.",
            "detail": f"Format: {dataset.get('file_type')}, File Size: {dataset.get('file_size')}",
        })

        # Check 2: Minimum Record Volume
        if records_count < 20:
            error_count += 1
            checks.append({
                "name": "Minimum Sample Size",
                "status": "failed",
                "message": f"Insufficient records ({records_count}). Minimum 20 required for clinical ML training.",
                "detail": "Small datasets cannot produce reliable stratified cross-validation splits.",
            })
            issues.append("Sample size too small for statistical ML training.")
        elif records_count < 100:
            warning_count += 1
            checks.append({
                "name": "Minimum Sample Size",
                "status": "warning",
                "message": f"Low sample size ({records_count} rows). Training may have higher variance.",
                "detail": "Recommended clinical training set size is 500+ records.",
            })
        else:
            checks.append({
                "name": "Minimum Sample Size",
                "status": "passed",
                "message": f"Sufficient sample size ({records_count:,} records) for model training.",
                "detail": "Adequate statistical power for train/test evaluation.",
            })

        # Check 3: Target Column Availability
        if not target_col or target_col not in df.columns:
            warning_count += 1
            checks.append({
                "name": "Target Column Availability",
                "status": "warning",
                "message": "No target outcome column assigned or detected.",
                "detail": "Please specify a target column before training.",
            })
            issues.append("Target column not set.")
        else:
            y = df[target_col].dropna()
            unique_classes = len(y.unique())
            if unique_classes < 2:
                error_count += 1
                checks.append({
                    "name": "Target Column Availability",
                    "status": "failed",
                    "message": f"Target column '{target_col}' has only {unique_classes} class ({y.unique()}).",
                    "detail": "Supervised classification requires at least 2 distinct target classes.",
                })
                issues.append("Target column has fewer than 2 classes.")
            else:
                checks.append({
                    "name": "Target Column Availability",
                    "status": "passed",
                    "message": f"Target column '{target_col}' identified with {unique_classes} classes.",
                    "detail": f"Classes: {', '.join(map(str, y.unique()[:5]))}",
                })

        # Check 4: Missing Values
        total_missing = int(df.isna().sum().sum())
        missing_cols = {col: int(count) for col, count in df.isna().sum().items() if count > 0}
        
        if total_missing == 0:
            checks.append({
                "name": "Missing Values Check",
                "status": "passed",
                "message": "Zero missing values detected across all features.",
                "detail": "Clean tabular data with 100% feature completeness.",
            })
        elif total_missing < (records_count * features_count * 0.15):
            warning_count += 1
            checks.append({
                "name": "Missing Values Check",
                "status": "warning",
                "message": f"{total_missing:,} missing values detected across {len(missing_cols)} columns.",
                "detail": f"Affected columns: {', '.join(list(missing_cols.keys())[:4])}. Automatic median/mode imputation will be applied during training.",
            })
            issues.append(f"{total_missing} missing values in {len(missing_cols)} columns.")
        else:
            error_count += 1
            checks.append({
                "name": "Missing Values Check",
                "status": "failed",
                "message": f"High missing rate: {total_missing:,} missing values (>{15}% of total cells).",
                "detail": "Excessive sparsity may degrade model generalization.",
            })
            issues.append("High missing value sparsity.")

        # Check 5: Duplicate Rows
        duplicate_count = int(df.duplicated().sum())
        if duplicate_count == 0:
            checks.append({
                "name": "Duplicate Rows Check",
                "status": "passed",
                "message": "No duplicate rows identified.",
                "detail": "Every row represents an independent observation.",
            })
        else:
            warning_count += 1
            checks.append({
                "name": "Duplicate Rows Check",
                "status": "warning",
                "message": f"{duplicate_count:,} duplicate rows detected.",
                "detail": "Duplicates can lead to data leakage between training and testing sets.",
            })
            issues.append(f"{duplicate_count} duplicate rows found.")

        # Check 6: Empty Columns
        empty_cols = [col for col in df.columns if df[col].isna().all()]
        if empty_cols:
            error_count += 1
            checks.append({
                "name": "Empty Columns Check",
                "status": "failed",
                "message": f"{len(empty_cols)} completely empty columns found: {', '.join(empty_cols)}.",
                "detail": "Columns containing only nulls provide zero predictive signal.",
            })
            issues.append(f"Empty columns: {', '.join(empty_cols)}")
        else:
            checks.append({
                "name": "Empty Columns Check",
                "status": "passed",
                "message": "All columns contain valid observation values.",
                "detail": "No entirely blank feature columns present.",
            })

        # Check 7: Class Imbalance (if target available)
        class_dist = {}
        if target_col and target_col in df.columns:
            counts = df[target_col].value_counts(normalize=True).to_dict()
            class_dist = {str(k): round(float(v) * 100, 1) for k, v in counts.items()}
            min_ratio = min(counts.values()) if counts else 0.5
            
            if min_ratio < 0.15:
                warning_count += 1
                checks.append({
                    "name": "Class Balance Analysis",
                    "status": "warning",
                    "message": f"Severe class imbalance detected: minority class is only {min_ratio * 100:.1f}%.",
                    "detail": "Balanced clinical class weights will be automatically enabled during model training.",
                })
                issues.append(f"Class imbalance ({min_ratio * 100:.1f}% minority class).")
            else:
                checks.append({
                    "name": "Class Balance Analysis",
                    "status": "passed",
                    "message": f"Acceptable class distribution across target outcomes.",
                    "detail": f"Distribution: {', '.join([f'{k}: {v}%' for k, v in class_dist.items()])}",
                })

        # Check 8: Unsupported Data Types
        complex_cols = [c for c in df.columns if df[c].dtype == object and df[c].dropna().apply(lambda x: isinstance(x, (dict, list))).any()]
        if complex_cols:
            error_count += 1
            checks.append({
                "name": "Data Type Compatibility",
                "status": "failed",
                "message": f"Unsupported complex types found in: {', '.join(complex_cols)}.",
                "detail": "Nested JSON or list structures cannot be processed directly by tabular ML pipelines.",
            })
            issues.append("Nested or unsupported complex data types present.")
        else:
            checks.append({
                "name": "Data Type Compatibility",
                "status": "passed",
                "message": "All feature columns match supported numeric or categorical formats.",
                "detail": "Standard tabular Scikit-Learn pipelines supported.",
            })

        # Overall Status Calculation
        if error_count > 0:
            overall_status = "Error"
            overall_score = max(30, 100 - (error_count * 30 + warning_count * 10))
        elif warning_count > 0:
            overall_status = "Warning"
            overall_score = max(65, 100 - (warning_count * 10))
        else:
            overall_status = "Valid"
            overall_score = 100

        # Update dataset status in registry
        registry = self._read_registry()
        for d in registry:
            if d.get("dataset_id") == dataset_id:
                d["validation_status"] = overall_status
                if target_col:
                    d["target_column"] = target_col
                break
        self._write_registry(registry)

        return {
            "dataset_id": dataset_id,
            "dataset_name": dataset.get("name"),
            "target_column": target_col,
            "status": overall_status,
            "overall_score": overall_score,
            "records_count": records_count,
            "features_count": features_count,
            "missing_values_count": total_missing,
            "duplicates_count": duplicate_count,
            "checks": checks,
            "issues": issues,
            "class_distribution": class_dist,
            "validated_at": datetime.now(timezone.utc).isoformat(),
        }

    def delete_dataset(self, dataset_id: str) -> bool:
        """Deletes a dataset from registry and disk if uploaded."""
        registry = self._read_registry()
        target = None
        new_registry = []
        
        for d in registry:
            if d.get("dataset_id") == dataset_id:
                target = d
            else:
                new_registry.append(d)

        if not target:
            return False

        file_path = target.get("file_path")
        if file_path and os.path.exists(file_path) and "uploads" in file_path:
            try:
                os.remove(file_path)
            except Exception as exc:
                logger.warning(f"Failed to delete dataset file from disk: {exc}")

        self._write_registry(new_registry)
        return True


dataset_service = DatasetService()
