/**
 * @file apiClient.js
 * HealthGuard AI Centralized Secure HTTP Client Layer
 * 
 * Manages base URLs, Bearer authentication headers, HttpOnly cookie credentials,
 * automatic 401 session expiration handling, and structured error normalization.
 */

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'hg_access_token';

// Event emitter for auth expiration events
const authListeners = new Set();

export function onUnauthorized(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

function notifyUnauthorized() {
  authListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to persist token to storage:', e);
  }
}

export function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Standardized Fetch Client with full error interception and security headers.
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Attach Bearer token if present
  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Always send and accept HttpOnly session cookies
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      // Avoid triggering loop if checking session
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        notifyUnauthorized();
      }
    }

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg =
        responseData?.message ||
        responseData?.detail ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message) ||
        `Request failed with status ${response.status}`;

      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = responseData;
      error.errors = responseData?.errors || [];
      throw error;
    }

    // Unpack unified envelope if present
    if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
      return responseData.data;
    }

    return responseData;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or offline failure
    console.warn(`[apiClient] Network request failed for ${endpoint}:`, err.message);
    const networkErr = new Error('Network connection error. Please verify backend server connectivity.');
    networkErr.isNetworkError = true;
    networkErr.original = err;
    throw networkErr;
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint, data, options) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint, data, options) =>
    request(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),
};
