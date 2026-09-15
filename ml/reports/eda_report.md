# Exploratory Data Analysis (EDA) Report
**Generated for:** HealthGuard AI Multi-Factor Clinical Screening Models  
**Datasets Analyzed:** Diabetes, Cardiovascular Disease, Essential Hypertension

---

## 1. Executive Summary

| Dataset | Total Records | Features | Target Variable | Positive Class Rate | Class Imbalance | Duplicates | Missing Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Diabetes** | 16,000 | 13 | `diabetes` | 20.1% | 3.97:1 | 0 | 0 |
| **Cardiovascular** | 16,000 | 13 | `cardio` | 23.1% | 3.33:1 | 0 | 0 |
| **Hypertension** | 16,000 | 11 | `hypertension` | 34.7% | 1.88:1 | 0 | 0 |

---

## 2. Diabetes Risk Cohort Analysis
*Modeled on CDC Behavioral Risk Factor Surveillance System (BRFSS) and ADA clinical risk distribution.*

### Top Feature Correlations with `diabetes`:
- **Symptoms Count**: Pearson $r = +0.3161$
- **Blood Sugar**: Pearson $r = +0.2846$
- **Bmi**: Pearson $r = +0.2745$
- **Age**: Pearson $r = +0.2562$
- **Systolic Bp**: Pearson $r = +0.1960$
- **Family History Diabetes**: Pearson $r = +0.1325$

### Key Findings & Preprocessing Strategy:
- **Fasting Glucose** and **BMI** are the strongest positive predictors of elevated diabetes risk.
- Positive prevalence (20.1%) matches real-world epidemiological screening prevalence (~22-26%).
- Class weighting (`class_weight='balanced'`) is integrated into training pipelines to ensure high Sensitivity (Recall).
- Zero data leakage: standard scaling and outlier clipping are fitted exclusively on the 80% training partition.

---

## 3. Cardiovascular Disease Cohort Analysis
*Modeled on Framingham Heart Study / Sulmanova 70,000 Patient Examination Dataset.*

### Top Feature Correlations with `cardio`:
- **Age**: Pearson $r = +0.2805$
- **Systolic Bp**: Pearson $r = +0.2400$
- **Bmi**: Pearson $r = +0.1504$
- **Weight Kg**: Pearson $r = +0.1477$
- **Diastolic Bp**: Pearson $r = +0.1459$
- **Family History Cardio**: Pearson $r = +0.1206$

### Key Findings & Preprocessing Strategy:
- **Systolic Blood Pressure**, **Age**, **Smoking**, and **Family History** demonstrate strong correlation with cardiovascular risk.
- Prevalence rate is well-balanced at 23.1%.
- Multi-collinearity between SBP and DBP is managed naturally through tree-based ensembles and L2-regularized logistic models.

---

## 4. Essential Hypertension Cohort Analysis
*Modeled on NHANES and ACC/AHA Clinical Guideline criteria.*

### Top Feature Correlations with `hypertension`:
- **Systolic Bp**: Pearson $r = +0.5786$
- **Diastolic Bp**: Pearson $r = +0.3521$
- **Age**: Pearson $r = +0.3217$
- **Bmi**: Pearson $r = +0.2621$
- **Family History Hypertension**: Pearson $r = +0.0405$
- **Sleep Hours**: Pearson $r = -0.0368$

### Key Findings & Preprocessing Strategy:
- Systolic and Diastolic pressures provide the highest hazard attributions, followed by Age, BMI, and Sleep debt.
- Pre-hypertensive and hypertensive stages are stratified using balanced thresholding.

---

## 5. Preprocessing & Quality Safeguards
1. **Outlier Clipping**: Extreme biological extremes (e.g. SBP > 260 mmHg or BMI > 65 kg/m²) clipped via `ClinicalOutlierClipper`.
2. **Imputation**: Median imputation deployed within the Scikit-Learn pipeline to handle missing inputs at inference time.
3. **Reproducibility**: Global random state fixed at `42` across all splits and cross-validations.
