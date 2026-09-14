/**
 * @file api.js
 * HealthGuard AI API Client Layer
 * 
 * Provides an asynchronous, typed API service interface for communication with
 * the HealthGuard FastAPI backend. When backend endpoints are offline or in dev,
 * gracefully falls back to a responsive, realistic local storage repository.
 */

import { analyzeHealthRisk, calculateBMI } from './assessmentEngine';
import { assessmentService } from './assessmentService';

export { assessmentService };

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY_USER = 'hg_user_profile';
const STORAGE_KEY_ASSESSMENTS = 'hg_assessment_history';
const STORAGE_KEY_LATEST = 'hg_latest_result';

// Baseline default realistic profile for initial exploration
const DEFAULT_USER = {
  id: 'usr_alex_chen_892',
  name: 'Alex Chen',
  email: 'alex.chen@healthguard.ai',
  age: 38,
  sex: 'male',
  heightCm: 178,
  weightKg: 78,
  bmi: 24.6,
  baselineActivity: 'moderate',
  bloodType: 'A+',
  emergencyContact: '+1 (555) 234-8901',
  avatarUrl: '',
  memberSince: 'March 2025',
};

// Initial baseline assessment history to show trends and recent cards out of the box
const INITIAL_HISTORICAL_ASSESSMENTS = [
  {
    id: 'HG-8942',
    date: '13 Sep 2026',
    timestamp: '2026-09-13T08:30:00.000Z',
    overallScore: 64,
    overallLevel: 'Moderate',
    confidence: 94,
    categories: {
      diabetes: {
        id: 'diabetes',
        name: 'Diabetes Risk',
        score: 58,
        level: 'Moderate',
        summary: 'Fasting glucose within upper normal margin with balanced metabolic parameters.',
        keyDrivers: ['Fasting glucose (98 mg/dL)', 'Normal BMI (24.6)', 'Paternal Type 2 history'],
        previousScore: '62',
      },
      cardiovascular: {
        id: 'cardiovascular',
        name: 'Cardiovascular Risk',
        score: 64,
        level: 'Moderate',
        summary: 'Mildly elevated systolic blood pressure. Regular aerobic exercise acts protectively.',
        keyDrivers: ['Systolic pressure (128 mmHg)', 'Non-smoker', 'Moderate aerobic activity'],
        previousScore: '67',
      },
      hypertension: {
        id: 'hypertension',
        name: 'Hypertension Risk',
        score: 62,
        level: 'Moderate',
        summary: 'Pre-hypertensive stage 1 readings. Dietary sodium modulation advised.',
        keyDrivers: ['Blood pressure (128/84 mmHg)', 'Average 6.5h sleep', 'Occasional work stress'],
        previousScore: '65',
      },
    },
    vitalsSnapshot: {
      systolicBP: 128,
      diastolicBP: 84,
      fastingBloodSugar: 98,
      heartRate: 74,
      heightCm: 178,
      weightKg: 78,
      bmi: 24.6,
    },
    explainableFactors: [
      {
        id: 'f_bp',
        feature: 'Systolic Blood Pressure',
        value: '128 mmHg',
        impact: 0.22,
        direction: 'elevating',
        explanation: 'Systolic pressure in pre-hypertensive threshold slightly elevates vascular workload.',
      },
      {
        id: 'f_activity',
        feature: 'Aerobic Exercise Frequency',
        value: '3-4 days/week',
        impact: -0.18,
        direction: 'mitigating',
        explanation: 'Consistent aerobic cardio provides strong vascular and insulin-sensitizing protection.',
      },
      {
        id: 'f_glucose',
        feature: 'Fasting Blood Glucose',
        value: '98 mg/dL',
        impact: 0.08,
        direction: 'neutral',
        explanation: 'Euglycemic morning reading maintains metabolic equilibrium.',
      },
      {
        id: 'f_smoking',
        feature: 'Tobacco Usage',
        value: 'Non-Smoker',
        impact: -0.15,
        direction: 'mitigating',
        explanation: 'Non-smoking baseline significantly lowers atherogenic plaque risk.',
      },
    ],
    recommendations: [
      {
        id: 'rec_1',
        category: 'monitoring',
        priority: 'high',
        title: 'Track Resting Blood Pressure Twice Weekly',
        description: 'Log morning resting blood pressure before caffeine to establish clinical baseline.',
        actionableSteps: ['Rest 5 min seated before reading', 'Use calibrated upper-arm cuff', 'Record weekly logs in HealthGuard AI'],
        iconName: 'Activity',
      },
      {
        id: 'rec_2',
        category: 'lifestyle',
        priority: 'medium',
        title: 'Optimize Sleep Consistency',
        description: 'Target 7.5 hours nightly to support nocturnal blood pressure dipping and cortisol reduction.',
        actionableSteps: ['Set consistent 10:30 PM wind-down', 'Keep bedroom temperature below 20°C'],
        iconName: 'Moon',
      },
      {
        id: 'rec_3',
        category: 'nutrition',
        priority: 'medium',
        title: 'Mediterranean Dietary Focus',
        description: 'Incorporate extra virgin olive oil, leafy greens, and reduce packaged sodium intake.',
        actionableSteps: ['Target <2,000 mg dietary sodium daily', 'Increase potassium-rich leafy greens'],
        iconName: 'Salad',
      },
    ],
    clinicalDisclaimer: 'HealthGuard AI provides early risk assessments for clinical decision support and wellness optimization. It does not provide medical diagnosis.',
  },
  {
    id: 'HG-7210',
    date: '18 Jul 2026',
    timestamp: '2026-07-18T10:15:00.000Z',
    overallScore: 68,
    overallLevel: 'Moderate',
    confidence: 93,
    categories: {
      diabetes: {
        id: 'diabetes',
        name: 'Diabetes Risk',
        score: 62,
        level: 'Moderate',
        summary: 'Elevated stress and irregular sleep contributed to borderline fasting glucose.',
        keyDrivers: ['Fasting glucose (104 mg/dL)', 'Normal BMI (25.1)', 'Paternal history'],
        previousScore: '70',
      },
      cardiovascular: {
        id: 'cardiovascular',
        name: 'Cardiovascular Risk',
        score: 67,
        level: 'Moderate',
        summary: 'Elevated blood pressure observed during period of reduced physical activity.',
        keyDrivers: ['Systolic pressure (134 mmHg)', 'Light exercise', 'Non-smoker'],
        previousScore: '71',
      },
      hypertension: {
        id: 'hypertension',
        name: 'Hypertension Risk',
        score: 65,
        level: 'Moderate',
        summary: 'Stage 1 readings recorded.',
        keyDrivers: ['Blood pressure (134/88 mmHg)', 'Low sleep (5.8h)'],
        previousScore: '68',
      },
    },
    vitalsSnapshot: {
      systolicBP: 134,
      diastolicBP: 88,
      fastingBloodSugar: 104,
      heartRate: 78,
      heightCm: 178,
      weightKg: 79.5,
      bmi: 25.1,
    },
    explainableFactors: [],
    recommendations: [],
    clinicalDisclaimer: 'HealthGuard AI decision support result.',
  },
  {
    id: 'HG-5890',
    date: '02 May 2026',
    timestamp: '2026-05-02T09:00:00.000Z',
    overallScore: 72,
    overallLevel: 'Elevated',
    confidence: 91,
    categories: {
      diabetes: { id: 'diabetes', name: 'Diabetes Risk', score: 68, level: 'Moderate', summary: 'Baseline assessment.', keyDrivers: [], previousScore: '--' },
      cardiovascular: { id: 'cardiovascular', name: 'Cardiovascular Risk', score: 71, level: 'Elevated', summary: 'Baseline assessment.', keyDrivers: [], previousScore: '--' },
      hypertension: { id: 'hypertension', name: 'Hypertension Risk', score: 69, level: 'Moderate', summary: 'Baseline assessment.', keyDrivers: [], previousScore: '--' },
    },
    vitalsSnapshot: {
      systolicBP: 138,
      diastolicBP: 90,
      fastingBloodSugar: 108,
      heartRate: 80,
      heightCm: 178,
      weightKg: 81,
      bmi: 25.6,
    },
    explainableFactors: [],
    recommendations: [],
    clinicalDisclaimer: 'HealthGuard AI decision support result.',
  }
];

// Local Repository Helpers
function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USER;
  }
}

function getStoredAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(INITIAL_HISTORICAL_ASSESSMENTS));
      return INITIAL_HISTORICAL_ASSESSMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_HISTORICAL_ASSESSMENTS;
  }
}

function getStoredLatestResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATEST);
    if (!raw) {
      const history = getStoredAssessments();
      const latest = history[0] || null;
      if (latest) localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(latest));
      return latest;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_HISTORICAL_ASSESSMENTS[0];
  }
}

/**
 * HealthGuard AI Service API Object
 */
export const healthApi = {
  /**
   * Fetches current authenticated user profile.
   * `GET /api/profile` or `GET /api/users/profile`
   */
  async getProfile() {
    try {
      const res = await fetch(`${API_BASE}/users/profile`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      // Backend not running, use local store
    }
    await new Promise(r => setTimeout(r, 120)); // Small simulated latency for smooth UX
    return getStoredUser();
  },

  /**
   * Updates user profile details.
   * `PUT /api/users/profile`
   */
  async updateProfile(updates) {
    const current = getStoredUser();
    const updated = {
      ...current,
      ...updates,
      bmi: calculateBMI(updates.heightCm || current.heightCm, updates.weightKg || current.weightKg),
    };
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      // Fallback to local
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    return updated;
  },

  /**
   * Submits a full multi-step health assessment for storage and ML preparation.
   * 
   * @param {Object} assessmentData 
   */
  async submitAssessment(assessmentData) {
    try {
      // Direct call to assessment service POST /api/assessments
      const savedDoc = await assessmentService.createAssessment(assessmentData);

      // Also compute deterministic decision support baseline for local demo continuity if needed
      const decisionSupportResult = analyzeHealthRisk(assessmentData);
      decisionSupportResult.id = savedDoc.assessment_id || decisionSupportResult.id;

      // Save to local storage history
      const history = getStoredAssessments();
      const updatedHistory = [decisionSupportResult, ...history];
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(updatedHistory));
      localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(decisionSupportResult));

      // Also update user vitals snapshot in profile
      if (assessmentData.vitals) {
        const user = getStoredUser();
        user.heightCm = assessmentData.vitals.heightCm || user.heightCm;
        user.weightKg = assessmentData.vitals.weightKg || user.weightKg;
        user.bmi = assessmentData.vitals.bmi || calculateBMI(user.heightCm, user.weightKg);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }

      return savedDoc;
    } catch (err) {
      console.error('API submit assessment error:', err);
      throw err;
    }
  },

  /**
   * Fetches latest computed risk assessment.
   * `GET /api/risk/latest`
   */
  async getLatestRiskResult() {
    try {
      const res = await fetch(`${API_BASE}/risk/latest`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    await new Promise(r => setTimeout(r, 100));
    return getStoredLatestResult();
  },

  /**
   * Fetches complete historical assessments log.
   * `GET /api/assessments`
   */
  async getAssessmentHistory() {
    try {
      const res = await fetch(`${API_BASE}/assessments`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }
    await new Promise(r => setTimeout(r, 150));
    return getStoredAssessments();
  },

  /**
   * Fetches longitudinal health trend series.
   * `GET /api/trends`
   */
  async getHealthTrends(timeframe = '6m') {
    try {
      const res = await fetch(`${API_BASE}/trends?timeframe=${timeframe}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    await new Promise(r => setTimeout(r, 100));
    const history = getStoredAssessments();
    
    // Transform history into sequential chronological trend data points
    return [...history]
      .reverse()
      .map((item, idx) => ({
        id: item.id || `pt-${idx}`,
        date: item.date || 'Recent',
        shortDate: (item.date || 'Recent').split(' ').slice(0, 2).join(' '),
        overallRisk: item.overallScore || 50,
        diabetesRisk: item.categories?.diabetes?.score || 50,
        cardiovascularRisk: item.categories?.cardiovascular?.score || 50,
        hypertensionRisk: item.categories?.hypertension?.score || 50,
        systolicBP: item.vitalsSnapshot?.systolicBP || item.systolic_bp || 120,
        diastolicBP: item.vitalsSnapshot?.diastolicBP || item.diastolic_bp || 80,
        fastingBloodSugar: item.vitalsSnapshot?.fastingBloodSugar || item.blood_sugar || 95,
        bmi: item.vitalsSnapshot?.bmi || item.bmi || 23.5,
        heartRate: item.vitalsSnapshot?.heartRate || item.heart_rate || 72,
      }));
  },

  /**
   * Fetches personalized wellness & preventive recommendations.
   * `GET /api/recommendations`
   */
  async getRecommendations() {
    try {
      const res = await fetch(`${API_BASE}/recommendations`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    const latest = getStoredLatestResult();
    return latest?.recommendations || [];
  },

  /**
   * Resets local data repository to default clean state.
   */
  resetLocalData() {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ASSESSMENTS);
    localStorage.removeItem(STORAGE_KEY_LATEST);
    localStorage.removeItem('hg_stored_assessments');
    localStorage.removeItem('hg_last_submitted_assessment');
    return { success: true };
  }
};
