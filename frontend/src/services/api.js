/**
 * @file api.js
 * HealthGuard AI API Client Layer
 * 
 * Provides an asynchronous, typed API service interface for communication with
 * the HealthGuard FastAPI backend using authenticated apiClient requests.
 */

import { apiClient } from './apiClient';
import { analyzeHealthRisk, calculateBMI } from './assessmentEngine';
import { assessmentService } from './assessmentService';

export { assessmentService };

const STORAGE_KEY_USER = 'hg_user_profile';
const STORAGE_KEY_ASSESSMENTS = 'hg_assessment_history';
const STORAGE_KEY_LATEST = 'hg_latest_result';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function getStoredAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function getStoredLatestResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATEST);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * HealthGuard AI Service API Object
 */
export const healthApi = {
  /**
   * Fetches current authenticated user profile.
   * `GET /api/users/profile`
   */
  async getProfile() {
    try {
      const data = await apiClient.get('/users/profile');
      if (data) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Backend unavailable or unauthenticated
    }
    return getStoredUser();
  },

  /**
   * Updates user profile details.
   * `PUT /api/users/profile`
   */
  async updateProfile(updates) {
    const current = getStoredUser() || {};
    const updated = {
      ...current,
      ...updates,
      bmi: calculateBMI(updates.heightCm || updates.height_cm || current.height_cm, updates.weightKg || updates.weight_kg || current.weight_kg),
    };
    try {
      const data = await apiClient.put('/users/profile', {
        name: updates.name,
        age: updates.age,
        gender: updates.gender || updates.sex,
        height_cm: updates.heightCm || updates.height_cm,
        weight_kg: updates.weightKg || updates.weight_kg,
        baseline_activity: updates.baselineActivity || updates.baseline_activity,
        blood_type: updates.bloodType || updates.blood_type,
        emergency_contact: updates.emergencyContact || updates.emergency_contact,
      });
      if (data) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    return updated;
  },

  /**
   * Submits a full multi-step health assessment for storage and ML prediction.
   * Calls POST /api/predict to execute trained Machine Learning models and persist to MongoDB.
   */
  async submitAssessment(assessmentData) {
    try {
      // 1. Execute live inference on real ML pipelines (POST /api/predict)
      let predictionDoc;
      try {
        predictionDoc = await assessmentService.predictRisk(assessmentData);
      } catch (mlErr) {
        console.warn('Direct predict API error:', mlErr);
        predictionDoc = null;
      }

      // 2. Also persist raw assessment document (POST /api/assessments)
      let savedAssessment;
      try {
        savedAssessment = await assessmentService.createAssessment(assessmentData);
      } catch (saveErr) {
        console.warn('Assessment save endpoint warning:', saveErr);
      }

      // If ML prediction succeeded, use genuine ML result
      let finalResult;
      if (predictionDoc && predictionDoc.categories) {
        finalResult = {
          ...predictionDoc,
          id: predictionDoc.assessment_id || savedAssessment?.assessment_id || `HG-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      } else {
        // Fallback calculation if offline
        finalResult = analyzeHealthRisk(assessmentData);
        finalResult.id = savedAssessment?.assessment_id || finalResult.id;
      }

      // Save to local storage history
      const history = getStoredAssessments();
      const updatedHistory = [finalResult, ...history.filter((h) => h.id !== finalResult.id)];
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(updatedHistory));
      localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(finalResult));

      return finalResult;
    } catch (err) {
      console.error('API submit assessment error:', err);
      throw err;
    }
  },

  /**
   * Fetches latest computed risk assessment from real ML model pipeline or storage.
   * `GET /api/predict/latest`
   */
  async getLatestRiskResult() {
    try {
      const data = await apiClient.get('/predict/latest');
      if (data && data.categories) {
        return {
          ...data,
          id: data.assessment_id || 'HG-8942',
          date: data.created_at
            ? new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
        };
      }
    } catch (e) {
      // Fallback
    }
    return getStoredLatestResult();
  },

  /**
   * Fetches complete historical assessments log.
   * `GET /api/assessments`
   */
  async getAssessmentHistory() {
    try {
      const data = await apiClient.get('/assessments');
      if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      // Fallback
    }
    return getStoredAssessments();
  },

  /**
   * Fetches longitudinal health trend series.
   * `GET /api/trends`
   */
  async getHealthTrends(timeframe = '6m') {
    try {
      const data = await apiClient.get(`/trends?timeframe=${timeframe}`);
      if (data && Array.isArray(data)) return data;
    } catch (e) {
      // Fallback
    }

    const history = getStoredAssessments();
    if (!history || history.length === 0) {
      return [];
    }

    // Transform history into sequential chronological trend data points
    return [...history]
      .reverse()
      .map((item, idx) => ({
        id: item.assessment_id || item.id || `pt-${idx}`,
        date: item.date || 'Recent',
        shortDate: (item.date || 'Recent').split(' ').slice(0, 2).join(' '),
        overallRisk: item.overallScore || 50,
        diabetesRisk: item.categories?.diabetes?.score || 50,
        cardiovascularRisk: item.categories?.cardiovascular?.score || 50,
        hypertensionRisk: item.categories?.hypertension?.score || 50,
        systolicBP: item.vitalsSnapshot?.systolicBP || item.vitals?.systolic_bp || 120,
        diastolicBP: item.vitalsSnapshot?.diastolicBP || item.vitals?.diastolic_bp || 80,
        fastingBloodSugar: item.vitalsSnapshot?.fastingBloodSugar || item.vitals?.blood_sugar || 95,
        bmi: item.vitalsSnapshot?.bmi || item.vitals?.bmi || 23.5,
        heartRate: item.vitalsSnapshot?.heartRate || item.vitals?.heart_rate || 72,
      }));
  },

  /**
   * Fetches personalized wellness & preventive recommendations.
   * `GET /api/recommendations`
   */
  async getRecommendations() {
    try {
      const data = await apiClient.get('/recommendations');
      if (data && Array.isArray(data)) return data;
    } catch (e) {
      // Fallback
    }
    const latest = getStoredLatestResult();
    return latest?.recommendations || [];
  },

  /**
   * Resets local data repository to clean state.
   */
  resetLocalData() {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ASSESSMENTS);
    localStorage.removeItem(STORAGE_KEY_LATEST);
    localStorage.removeItem('hg_stored_assessments');
    localStorage.removeItem('hg_last_submitted_assessment');
    return { success: true };
  },
};
