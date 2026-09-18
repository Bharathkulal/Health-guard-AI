import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export function AdminProtectedRoute({ children }) {
  const { isAdminAuth, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020704]">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!isAdminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children || <Outlet />;
}
