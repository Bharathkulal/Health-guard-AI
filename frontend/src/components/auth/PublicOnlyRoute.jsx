/**
 * @file PublicOnlyRoute.jsx
 * Route guard for public-only pages like /login and /register.
 * Redirects already authenticated users to /dashboard.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Will briefly transition or render cleanly
  }

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    const redirectPath = redirectParam || location.state?.from?.pathname || '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}
