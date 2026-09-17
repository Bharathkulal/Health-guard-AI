/**
 * @file assessmentEngine.js
 * Clinical Decision-Support Risk Stratification Engine (Legacy ML algorithms removed)
 * 
 * Provides utility functions for basic vitals math.
 */

/**
 * Calculates Body Mass Index (BMI) from height (cm) and weight (kg).
 * @param {number} heightCm 
 * @param {number} weightKg 
 * @returns {number} BMI rounded to 1 decimal place
 */
export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Returns clinical category for BMI.
 * @param {number} bmi 
 * @returns {{ label: string, color: string, isElevated: boolean }}
 */
export function getBMICategory(bmi) {
  if (!bmi || bmi <= 0) return { label: 'Unknown', color: 'text-slate-400', isElevated: false };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', isElevated: false };
  if (bmi < 25.0) return { label: 'Normal Range', color: 'text-emerald-400', isElevated: false };
  if (bmi < 30.0) return { label: 'Overweight', color: 'text-amber-400', isElevated: true };
  return { label: 'Obese (Elevated Risk)', color: 'text-rose-400', isElevated: true };
}

/**
 * Maps numeric score to standard risk level string.
 * @param {number} score (0-100)
 * @returns {'Low' | 'Moderate' | 'Elevated' | 'High'}
 */
export function getRiskLevel(score) {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'Elevated';
  return 'High';
}
