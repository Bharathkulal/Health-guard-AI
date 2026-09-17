/**
 * @file api.js
 * HealthGuard AI API Client Layer
 * 
 * Provides an asynchronous, typed API service interface for communication with
 * the HealthGuard FastAPI backend using authenticated apiClient requests.
 */

import { apiClient } from './apiClient';
import { calculateBMI } from './assessmentEngine';
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
      // Backend unavailable or unauthenticated, return cached profile if exists
    }
    return getStoredUser();
  },

  /**
   * Updates user profile details.
   * `PUT /api/users/profile`
   */
  async updateProfile(updates) {
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
    throw new Error('Failed to update profile');
  },

  /**
   * Submits a full multi-step health assessment for storage and ML prediction.
   * Calls POST /api/health/assess to execute trained Machine Learning models and persist to MongoDB.
   */
  async submitAssessment(assessmentData) {
    let predictionDoc = await assessmentService.predictRisk(assessmentData);
    
    // Attempt to persist raw assessment document
    try {
      await assessmentService.createAssessment(assessmentData);
    } catch (saveErr) {
      console.warn('Assessment save endpoint warning:', saveErr);
    }

    if (!predictionDoc || !predictionDoc.categories) {
      throw new Error('ML Prediction failed to return expected results.');
    }

    const finalResult = {
      ...predictionDoc,
      id: predictionDoc.assessment_id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    // Save to local storage history
    const history = getStoredAssessments();
    const updatedHistory = [finalResult, ...history.filter((h) => h.id !== finalResult.id)];
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(updatedHistory));
    localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(finalResult));

    return finalResult;
  },

  /**
   * Fetches latest computed risk assessment from real ML model pipeline or storage.
   * `GET /api/predict/latest`
   */
  async getLatestRiskResult() {
    try {
      const data = await apiClient.get('/predict/latest');
      if (data && data.categories) {
        const result = {
          ...data,
          id: data.assessment_id,
          date: data.created_at
            ? new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
        };
        localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(result));
        return result;
      }
    } catch (e) {
      // Return cached latest if backend unavailable
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
        localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Fallback to cache
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

    // Transform history into sequential chronological trend data points using ONLY real data
    return [...history]
      .reverse()
      .map((item, idx) => ({
        id: item.assessment_id || item.id,
        date: item.date || 'Recent',
        shortDate: (item.date || 'Recent').split(' ').slice(0, 2).join(' '),
        overallRisk: item.overallScore,
        diabetesRisk: item.categories?.diabetes?.score,
        heartRisk: item.categories?.heart?.score,
        systolicBP: item.vitalsSnapshot?.systolicBP || item.vitals?.systolic_bp,
        diastolicBP: item.vitalsSnapshot?.diastolicBP || item.vitals?.diastolic_bp,
        fastingBloodSugar: item.vitalsSnapshot?.fastingBloodSugar || item.vitals?.blood_sugar,
        bmi: item.vitalsSnapshot?.bmi || item.vitals?.bmi,
        heartRate: item.vitalsSnapshot?.heartRate || item.vitals?.heart_rate,
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
