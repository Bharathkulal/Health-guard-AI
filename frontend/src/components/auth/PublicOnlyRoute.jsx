/**
 * @file PublicOnlyRoute.jsx
 * Route guard for public-only pages like /login and /register.
 * Redirects already authenticated users to /dashboard.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Will briefly transition or render cleanly
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
