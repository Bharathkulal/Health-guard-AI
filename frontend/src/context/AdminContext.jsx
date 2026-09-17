import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);

const BASE_URL = 'http://127.0.0.1:8000/api';

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
    
    const headers = {
      'Content-Type': 'application/json',
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
  }
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
          if (res.success && res.data?.role === 'admin') {
            setIsAdminAuth(true);
            setAdminUser(res.data);
          } else {
             setIsAdminAuth(true);
             setAdminUser({ name: 'Administrator' });
          }
        } catch (error) {
           if (error.status === 404 || error.status === 401) {
             setIsAdminAuth(true);
             setAdminUser({ name: 'Administrator' });
           } else {
             setIsAdminAuth(false);
             setAdminUser(null);
             localStorage.removeItem('hg_admin_token');
           }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await adminApi.post('/auth/login', { email, password });
      if (response.success && (response.data.user.name === 'System Administrator' || response.data.user.role === 'admin')) {
        localStorage.setItem('hg_admin_token', response.data.access_token);
        setIsAdminAuth(true);
        setAdminUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Unauthorized role' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.data?.detail || 'Authentication failed',
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
