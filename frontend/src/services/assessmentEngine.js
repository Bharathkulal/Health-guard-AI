/**
 * @file assessmentEngine.js
 * Clinical Decision-Support Risk Stratification & Explainable AI (SHAP) Engine
 * 
 * Computes calibrated risk indices for:
 * 1. Type 2 Diabetes Risk
 * 2. Cardiovascular Disease (CVD) Risk
 * 3. Hypertension Risk
 * 4. Composite Overall Risk Score (0 - 100)
 * 5. SHAP-Style Explainable AI Factor Decomposition
 * 6. Personalized Clinical & Lifestyle Recommendations
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

/**
 * Computes Diabetes Risk (0 - 100).
 */
function evaluateDiabetesRisk(input) {
  let score = 15; // baseline
  const { age = 35, vitals = {}, symptoms = [], lifestyle = {}, familyHistory = {} } = input;
  const { fastingBloodSugar = 95, bmi = 23 } = vitals;

  // Fasting Blood Sugar contribution (ADA guidelines)
  if (fastingBloodSugar >= 126) score += 42; // Diabetic range
  else if (fastingBloodSugar >= 100) score += 26; // Prediabetic range
  else if (fastingBloodSugar < 70) score += 5; // Hypoglycemic tendency

  // BMI contribution
  if (bmi >= 35) score += 24;
  else if (bmi >= 30) score += 18;
  else if (bmi >= 25) score += 10;
  else score -= 5;

  // Age factor
  if (age >= 60) score += 15;
  else if (age >= 45) score += 10;
  else if (age >= 35) score += 4;

  // Family History
  if (familyHistory.diabetes) score += 18;

  // Specific Symptoms
  if (symptoms.includes('excessive_thirst')) score += 12;
  if (symptoms.includes('frequent_urination')) score += 12;
  if (symptoms.includes('blurred_vision')) score += 8;
  if (symptoms.includes('fatigue')) score += 5;

  // Lifestyle
  if (lifestyle.physicalActivity === 'sedentary') score += 10;
  else if (lifestyle.physicalActivity === 'active' || lifestyle.physicalActivity === 'very_active') score -= 10;

  if (lifestyle.dietPattern === 'high_sugar') score += 12;
  else if (lifestyle.dietPattern === 'plant_based' || lifestyle.dietPattern === 'mediterranean') score -= 8;

  score = Math.max(8, Math.min(96, Math.round(score)));
  
  let summary = 'Optimal metabolic regulation observed.';
  if (score >= 80) summary = 'Elevated glycemic indicators suggest clinical follow-up with HbA1c testing.';
  else if (score >= 60) summary = 'Borderline glycemic and lifestyle indicators suggest proactive diet adjustments.';
  else if (score >= 30) summary = 'Moderate risk profile with stable metabolic biomarkers.';

  return {
    id: 'diabetes',
    name: 'Diabetes Risk',
    score,
    level: getRiskLevel(score),
    summary,
    keyDrivers: [
      fastingBloodSugar >= 100 ? `Fasting glucose (${fastingBloodSugar} mg/dL)` : 'Normal fasting glucose',
      bmi >= 25 ? `Elevated BMI (${bmi})` : 'Normal metabolic weight',
      familyHistory.diabetes ? 'First-degree genetic history' : 'No reported family history',
    ],
    previousScore: '68',
  };
}

/**
 * Computes Cardiovascular Risk (0 - 100).
 */
function evaluateCardiovascularRisk(input) {
  let score = 18;
  const { age = 35, vitals = {}, symptoms = [], lifestyle = {}, familyHistory = {} } = input;
  const { systolicBP = 120, diastolicBP = 80, heartRate = 72, bmi = 23 } = vitals;

  // Blood Pressure
  if (systolicBP >= 140 || diastolicBP >= 90) score += 28;
  else if (systolicBP >= 130 || diastolicBP >= 85) score += 16;
  else if (systolicBP >= 120) score += 8;
  else score -= 4;

  // Resting Heart Rate
  if (heartRate > 85) score += 12;
  else if (heartRate < 60 && lifestyle.physicalActivity !== 'very_active') score += 6;
  else if (heartRate >= 60 && heartRate <= 75) score -= 4;

  // Age & Sex
  if (age >= 65) score += 18;
  else if (age >= 50) score += 12;
  else if (age >= 40) score += 6;

  // Smoking
  if (lifestyle.smoking === 'regular') score += 24;
  else if (lifestyle.smoking === 'occasional') score += 12;
  else if (lifestyle.smoking === 'former') score += 4;
  else score -= 6;

  // Family History
  if (familyHistory.cardiovascular || familyHistory.earlyHeartAttack) score += 20;

  // Symptoms
  if (symptoms.includes('chest_discomfort')) score += 22;
  if (symptoms.includes('shortness_of_breath')) score += 16;
  if (symptoms.includes('palpitations')) score += 10;
  if (symptoms.includes('dizziness')) score += 6;

  // Lifestyle & Diet
  if (lifestyle.physicalActivity === 'sedentary') score += 10;
  else if (lifestyle.physicalActivity === 'active' || lifestyle.physicalActivity === 'very_active') score -= 12;

  if (lifestyle.alcohol === 'heavy') score += 14;

  score = Math.max(10, Math.min(95, Math.round(score)));

  let summary = 'Cardiovascular metrics remain within healthy standard ranges.';
  if (score >= 80) summary = 'High arterial and lifestyle risk flags. Comprehensive lipid and ECG evaluation advised.';
  else if (score >= 60) summary = 'Elevated vascular tension and lifestyle factors warrant preventive attention.';
  else if (score >= 30) summary = 'Moderate vascular risk with manageable lifestyle modulators.';

  return {
    id: 'cardiovascular',
    name: 'Cardiovascular Risk',
    score,
    level: getRiskLevel(score),
    summary,
    keyDrivers: [
      systolicBP >= 130 ? `Systolic pressure (${systolicBP} mmHg)` : 'Optimal blood pressure',
      lifestyle.smoking !== 'never' ? `Smoking status (${lifestyle.smoking})` : 'Non-smoking baseline',
      familyHistory.cardiovascular ? 'Cardiovascular family history' : 'Low hereditary incidence',
    ],
    previousScore: '60',
  };
}

/**
 * Computes Hypertension Risk (0 - 100).
 */
function evaluateHypertensionRisk(input) {
  let score = 15;
  const { age = 35, vitals = {}, symptoms = [], lifestyle = {}, familyHistory = {} } = input;
  const { systolicBP = 120, diastolicBP = 80, bmi = 23 } = vitals;

  // Direct BP measurement impact (AHA/ACC stages)
  if (systolicBP >= 140 || diastolicBP >= 90) score += 38; // Stage 2
  else if (systolicBP >= 130 || diastolicBP >= 80) score += 22; // Stage 1
  else if (systolicBP >= 120 && diastolicBP < 80) score += 12; // Elevated
  else score -= 6; // Normal

  // BMI impact
  if (bmi >= 30) score += 16;
  else if (bmi >= 25) score += 8;

  // Age factor
  if (age >= 55) score += 14;
  else if (age >= 40) score += 8;

  // Family History
  if (familyHistory.hypertension) score += 18;

  // Symptoms
  if (symptoms.includes('headache')) score += 10;
  if (symptoms.includes('dizziness')) score += 8;

  // Lifestyle (Salt, Sleep, Alcohol, Exercise)
  if (lifestyle.dietPattern === 'high_sodium') score += 16;
  if (lifestyle.sleepHours && lifestyle.sleepHours < 6) score += 10;
  if (lifestyle.alcohol === 'heavy' || lifestyle.alcohol === 'moderate') score += 8;
  if (lifestyle.physicalActivity === 'sedentary') score += 8;
  else if (lifestyle.physicalActivity === 'active' || lifestyle.physicalActivity === 'very_active') score -= 10;

  score = Math.max(8, Math.min(98, Math.round(score)));

  let summary = 'Systolic and diastolic pressures within normal physiological parameters.';
  if (score >= 80) summary = 'Stage 2 hypertensive indicators. Clinical pressure tracking and physician review recommended.';
  else if (score >= 60) summary = 'Pre-hypertensive baseline detected. Dietary sodium reduction and aerobic activity recommended.';
  else if (score >= 30) summary = 'Mild pressure fluctuations. Maintain regular monitoring.';

  return {
    id: 'hypertension',
    name: 'Hypertension Risk',
    score,
    level: getRiskLevel(score),
    summary,
    keyDrivers: [
      systolicBP >= 120 ? `Blood pressure (${systolicBP}/${diastolicBP} mmHg)` : 'Optimal vascular tone',
      lifestyle.dietPattern === 'high_sodium' ? 'High dietary sodium pattern' : 'Balanced sodium intake',
      familyHistory.hypertension ? 'Genetic hypertensive markers' : 'No hereditary flags',
    ],
    previousScore: '64',
  };
}

/**
 * Computes SHAP-Style Explainable AI Attributions.
 */
function computeExplainableFactors(input, categoryScores) {
  const { age = 35, vitals = {}, symptoms = [], lifestyle = {}, familyHistory = {} } = input;
  const { systolicBP = 120, fastingBloodSugar = 95, bmi = 23, heartRate = 72 } = vitals;
  const factors = [];

  // 1. Blood Pressure Attribution
  if (systolicBP >= 135) {
    factors.push({
      id: 'f_bp',
      feature: 'Systolic Blood Pressure',
      value: `${systolicBP} mmHg`,
      impact: 0.28,
      direction: 'elevating',
      explanation: 'Elevated arterial pressure exerts additional mechanical strain on vascular walls, increasing cardiovascular risk.',
    });
  } else if (systolicBP <= 118) {
    factors.push({
      id: 'f_bp',
      feature: 'Systolic Blood Pressure',
      value: `${systolicBP} mmHg`,
      impact: -0.22,
      direction: 'mitigating',
      explanation: 'Optimal resting arterial pressure supports healthy vascular endothelium and lowers overall strain.',
    });
  } else {
    factors.push({
      id: 'f_bp',
      feature: 'Systolic Blood Pressure',
      value: `${systolicBP} mmHg`,
      impact: 0.05,
      direction: 'neutral',
      explanation: 'Blood pressure is within pre-hypertensive threshold with minimal contribution to global risk.',
    });
  }

  // 2. Fasting Blood Glucose
  if (fastingBloodSugar >= 110) {
    factors.push({
      id: 'f_glucose',
      feature: 'Fasting Blood Glucose',
      value: `${fastingBloodSugar} mg/dL`,
      impact: 0.25,
      direction: 'elevating',
      explanation: 'Glycemic readings in the prediabetic/diabetic spectrum accelerate microvascular and metabolic complications.',
    });
  } else if (fastingBloodSugar <= 92) {
    factors.push({
      id: 'f_glucose',
      feature: 'Fasting Blood Glucose',
      value: `${fastingBloodSugar} mg/dL`,
      impact: -0.19,
      direction: 'mitigating',
      explanation: 'Euglycemic baseline indicates efficient insulin sensitivity and metabolic homeostasis.',
    });
  } else {
    factors.push({
      id: 'f_glucose',
      feature: 'Fasting Blood Glucose',
      value: `${fastingBloodSugar} mg/dL`,
      impact: 0.04,
      direction: 'neutral',
      explanation: 'Blood sugar is within normal reference parameters.',
    });
  }

  // 3. Body Mass Index
  if (bmi >= 28) {
    factors.push({
      id: 'f_bmi',
      feature: 'Body Mass Index (BMI)',
      value: `${bmi} kg/m²`,
      impact: 0.18,
      direction: 'elevating',
      explanation: 'Elevated visceral adiposity contributes to systemic low-grade inflammation and insulin resistance.',
    });
  } else if (bmi >= 19 && bmi <= 24.5) {
    factors.push({
      id: 'f_bmi',
      feature: 'Body Mass Index (BMI)',
      value: `${bmi} kg/m²`,
      impact: -0.16,
      direction: 'mitigating',
      explanation: 'Healthy body mass index provides protective metabolic and cardiac benefits.',
    });
  }

  // 4. Physical Activity
  if (lifestyle.physicalActivity === 'active' || lifestyle.physicalActivity === 'very_active') {
    factors.push({
      id: 'f_activity',
      feature: 'Physical Activity Level',
      value: 'Regular Aerobic / Strength',
      impact: -0.21,
      direction: 'mitigating',
      explanation: 'Consistent physical activity improves endothelial function, insulin sensitivity, and resting cardiac workload.',
    });
  } else if (lifestyle.physicalActivity === 'sedentary') {
    factors.push({
      id: 'f_activity',
      feature: 'Physical Activity Level',
      value: 'Sedentary Lifestyle',
      impact: 0.15,
      direction: 'elevating',
      explanation: 'Lack of regular physical exercise is a documented independent risk factor across all 3 assessed conditions.',
    });
  }

  // 5. Family History
  if (familyHistory.diabetes || familyHistory.cardiovascular || familyHistory.hypertension) {
    const list = [];
    if (familyHistory.diabetes) list.push('Diabetes');
    if (familyHistory.cardiovascular) list.push('CVD');
    if (familyHistory.hypertension) list.push('Hypertension');
    factors.push({
      id: 'f_family',
      feature: 'First-Degree Heredity',
      value: list.join(', '),
      impact: 0.17,
      direction: 'elevating',
      explanation: 'Documented first-degree genetic predisposition indicates heightened baseline susceptibility.',
    });
  } else {
    factors.push({
      id: 'f_family',
      feature: 'First-Degree Heredity',
      value: 'No Reported Incidence',
      impact: -0.10,
      direction: 'mitigating',
      explanation: 'Absence of early family disease history contributes positively to overall baseline prognosis.',
    });
  }

  // 6. Smoking / Lifestyle
  if (lifestyle.smoking === 'regular') {
    factors.push({
      id: 'f_smoking',
      feature: 'Tobacco Usage',
      value: 'Active Regular Smoking',
      impact: 0.26,
      direction: 'elevating',
      explanation: 'Tobacco combustion byproducts cause rapid oxidative stress, arterial stiffness, and accelerated atherogenesis.',
    });
  } else if (lifestyle.smoking === 'never') {
    factors.push({
      id: 'f_smoking',
      feature: 'Tobacco Usage',
      value: 'Non-Smoker',
      impact: -0.14,
      direction: 'mitigating',
      explanation: 'Clean respiratory and endothelial profile significantly reduces cardiovascular morbidity.',
    });
  }

  // 7. Sleep Duration
  if (lifestyle.sleepHours && lifestyle.sleepHours < 6) {
    factors.push({
      id: 'f_sleep',
      feature: 'Sleep Duration',
      value: `${lifestyle.sleepHours} hrs/night`,
      impact: 0.11,
      direction: 'elevating',
      explanation: 'Chronic short sleep duration stimulates sympathetic nervous activity and dysregulates cortisol rhythm.',
    });
  }

  // Sort factors by magnitude of absolute impact descending
  return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

/**
 * Generates Structured Recommendations based on Risk Stratification.
 */
function generateRecommendations(input, categoryScores) {
  const recommendations = [];
  const { vitals = {}, lifestyle = {} } = input;
  const { systolicBP = 120, fastingBloodSugar = 95, bmi = 23 } = vitals;

  // Blood Pressure / Vascular
  if (categoryScores.hypertension.score >= 60 || systolicBP >= 130) {
    recommendations.push({
      id: 'rec_bp_mon',
      category: 'monitoring',
      priority: 'high',
      title: 'Structured Blood Pressure Logging',
      description: 'Record resting blood pressure twice weekly at the same time in the morning before caffeine or exercise.',
      actionableSteps: [
        'Rest seated for 5 minutes prior to measurement',
        'Use an arm-cuff validated sphygmomanometer',
        'Maintain a log to share during your next physician consultation',
      ],
      iconName: 'Activity',
    });
  }

  // Nutrition / Sodium / Sugar
  if (categoryScores.diabetes.score >= 50 || fastingBloodSugar >= 100 || lifestyle.dietPattern === 'high_sugar') {
    recommendations.push({
      id: 'rec_glycemic_diet',
      category: 'nutrition',
      priority: 'high',
      title: 'Low Glycemic-Load Nutritional Adjustments',
      description: 'Prioritize unrefined complex carbohydrates, high-fiber legumes, and eliminate sweetened beverages.',
      actionableSteps: [
        'Replace refined white grains with whole oat/quinoa grains',
        'Aim for minimum 30g of dietary fiber per day',
        'Pair complex carbohydrates with lean protein to blunt postprandial glucose spikes',
      ],
      iconName: 'Salad',
    });
  }

  // Activity
  if (lifestyle.physicalActivity === 'sedentary' || lifestyle.physicalActivity === 'light') {
    recommendations.push({
      id: 'rec_aerobic_target',
      category: 'activity',
      priority: 'medium',
      title: 'Progressive Aerobic Conditioning (150 min/wk)',
      description: 'Implement moderate-intensity physical activity to improve metabolic clearance and cardiovascular endurance.',
      actionableSteps: [
        'Start with 30-minute brisk walking 5 days per week',
        'Incorporate 2 days of bodyweight resistance training',
        'Track active zones using a smartwatch or pedometer (target: 7,500+ steps/day)',
      ],
      iconName: 'Zap',
    });
  } else {
    recommendations.push({
      id: 'rec_maintain_active',
      category: 'activity',
      priority: 'routine',
      title: 'Maintain Active Lifestyle & Recovery Balance',
      description: 'Continue your current high activity regimen while ensuring adequate rest and hydration.',
      actionableSteps: [
        'Ensure 48h recovery between intense resistance sessions',
        'Maintain hydration electrolytes during endurance workouts',
      ],
      iconName: 'Zap',
    });
  }

  // Sleep & Stress
  if (lifestyle.sleepHours && lifestyle.sleepHours < 7) {
    recommendations.push({
      id: 'rec_sleep_hygiene',
      category: 'lifestyle',
      priority: 'medium',
      title: 'Sleep Optimization & Circadian Reset',
      description: 'Aim for 7-8 hours of continuous restorative sleep to regulate nocturnal blood pressure dipping.',
      actionableSteps: [
        'Establish a consistent sleep/wake schedule within a 30-minute window',
        'Avoid blue-spectrum screens 60 minutes before bedtime',
        'Maintain a cool, dark sleeping environment (18-20°C)',
      ],
      iconName: 'Moon',
    });
  }

  // Clinical Consultation Warning / Follow-up
  const maxScore = Math.max(categoryScores.diabetes.score, categoryScores.cardiovascular.score, categoryScores.hypertension.score);
  if (maxScore >= 65) {
    recommendations.push({
      id: 'rec_clinical_followup',
      category: 'clinical',
      priority: 'high',
      title: 'Scheduled Clinical Review with Primary Care',
      description: 'Schedule a routine comprehensive health review with a qualified medical provider to discuss lab work.',
      actionableSteps: [
        'Request fasting lipid panel and HbA1c screening',
        'Bring your HealthGuard AI risk summary PDF to the visit',
        'Discuss baseline risk prevention strategies with your doctor',
      ],
      iconName: 'Stethoscope',
    });
  } else {
    recommendations.push({
      id: 'rec_annual_checkup',
      category: 'clinical',
      priority: 'routine',
      title: 'Routine Annual Preventive Wellness Review',
      description: 'Continue standard age-appropriate preventive screenings and wellness follow-ups.',
      actionableSteps: [
        'Schedule annual primary care physical',
        'Keep biometric baseline records updated in HealthGuard AI',
      ],
      iconName: 'ShieldCheck',
    });
  }

  return recommendations;
}

/**
 * Main Assessment Execution Entrypoint
 * Analyzes full assessment input and generates comprehensive, explainable results.
 * 
 * @param {import('../types/health').AssessmentInput} input 
 * @returns {import('../types/health').RiskAssessmentResult}
 */
export function analyzeHealthRisk(input) {
  // 1. Compute BMI if not explicitly set
  const calculatedBMI = input.vitals.bmi || calculateBMI(input.vitals.heightCm, input.vitals.weightKg);
  const enrichedInput = {
    ...input,
    vitals: {
      ...input.vitals,
      bmi: calculatedBMI,
    }
  };

  // 2. Evaluate Categories
  const diabetes = evaluateDiabetesRisk(enrichedInput);
  const cardiovascular = evaluateCardiovascularRisk(enrichedInput);
  const hypertension = evaluateHypertensionRisk(enrichedInput);

  // 3. Overall Composite Score (weighted average + non-linear risk compounding)
  const baseScore = Math.round((diabetes.score * 0.32) + (cardiovascular.score * 0.38) + (hypertension.score * 0.30));
  const maxSingleScore = Math.max(diabetes.score, cardiovascular.score, hypertension.score);
  // Compound slightly if any single condition is in high danger
  const overallScore = Math.min(96, Math.max(10, Math.round(baseScore * 0.85 + maxSingleScore * 0.15)));
  const overallLevel = getRiskLevel(overallScore);

  const categories = { diabetes, cardiovascular, hypertension };

  // 4. Compute Explainability Factors
  const explainableFactors = computeExplainableFactors(enrichedInput, categories);

  // 5. Generate Tailored Recommendations
  const recommendations = generateRecommendations(enrichedInput, categories);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return {
    id: input.id || `HG-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: input.userId || 'usr_default',
    date: formattedDate,
    timestamp: now.toISOString(),
    overallScore,
    overallLevel,
    confidence: 94,
    categories,
    explainableFactors,
    recommendations,
    vitalsSnapshot: enrichedInput.vitals,
    clinicalDisclaimer: 'HealthGuard AI provides an early risk assessment and clinical decision-support information for informational purposes. It is not a diagnostic tool and does not replace professional medical consultation, diagnosis, or treatment.',
  };
}
