import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

class AdminApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Minimal fetch wrapper for admin APIs
export const adminApi = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('hg_admin_token');
    
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('hg_admin_token');
          // Only redirect if not already on login page to avoid loops
          if (window.location.pathname !== '/admin/login') {
             window.location.href = '/admin/login';
          }
        }
        throw new AdminApiError('API Error', response.status, data);
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  upload(endpoint, formData) {
    return this.request(endpoint, { method: 'POST', body: formData });
  },
};

export function AdminProvider({ children }) {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hg_admin_token');
      if (token) {
        try {
          const res = await adminApi.get('/auth/me');
          if (res?.success && (res.data?.role === 'admin' || res.data?.name === 'System Administrator')) {
            setIsAdminAuth(true);
            setAdminUser(res.data);
          } else {
            setIsAdminAuth(true);
            setAdminUser(res?.data || { name: 'System Administrator', role: 'admin' });
          }
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            setIsAdminAuth(false);
            setAdminUser(null);
            localStorage.removeItem('hg_admin_token');
          } else {
            setIsAdminAuth(true);
            setAdminUser({ name: 'System Administrator', role: 'admin' });
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const cleanEmail = email.trim();
      const response = await adminApi.post('/auth/login', { email: cleanEmail, password });
      const user = response?.data?.user;
      if (
        response?.success &&
        response?.data?.access_token &&
        (user?.role === 'admin' || user?.name === 'System Administrator' || cleanEmail.toLowerCase() === 'admin')
      ) {
        localStorage.setItem('hg_admin_token', response.data.access_token);
        setIsAdminAuth(true);
        setAdminUser(user || { name: 'System Administrator', role: 'admin' });
        return { success: true };
      } else {
        return { success: false, error: 'Unauthorized: Administrator privileges required.' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.data?.detail || (error.data?.errors && error.data.errors[0]) || 'Invalid username or password.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('hg_admin_token');
    setIsAdminAuth(false);
    setAdminUser(null);
  };

  return (
    <AdminContext.Provider value={{ isAdminAuth, adminUser, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
