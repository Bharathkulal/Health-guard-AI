import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export function AdminProtectedRoute({ children }) {
  const { isAdminAuth, loading } = useAdmin();

  if (loading) {
    return null; // Or a small loading spinner
  }

  if (!isAdminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children || <Outlet />;
}
