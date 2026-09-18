import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HealthProvider } from './context/HealthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Authenticated Application Shell & Pages
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { TrendsPage } from './pages/TrendsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Helper component for Admin Login redirection
function AdminLoginRoute() {
  const { isAdminAuth, loading } = useAdmin();
  if (loading) return null;
  return isAdminAuth ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
}

// Component to enforce theme classes without flickering
function ThemeEnforcer() {
  const location = useLocation();
  
  useEffect(() => {
    const isDarkRoute = location.pathname.startsWith('/admin');
    const root = document.documentElement;
    if (isDarkRoute) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <AuthProvider>
          <HealthProvider>
            <BrowserRouter>
              <ThemeEnforcer />
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<AdminLoginRoute />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />

                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public-Only Auth Routes (Redirect to /dashboard if logged in) */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Protected Clinical Application Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/assessment" element={<AssessmentPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/results/:id" element={<ResultsPage />} />
                  <Route path="/trends" element={<TrendsPage />} />
                  <Route path="/history" element={<Navigate to="/trends" replace />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback Catch-All Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </HealthProvider>
        </AuthProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}
