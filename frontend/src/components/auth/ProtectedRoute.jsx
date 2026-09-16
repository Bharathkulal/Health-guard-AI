/**
 * @file ProtectedRoute.jsx
 * Route guard ensuring only authenticated users can access clinical dashboard, assessments, and profile.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center tech-grid ${
        isDark ? 'bg-[#030806] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}>
        <div className="fixed inset-0 radial-glow pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-sm -z-10 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold tracking-tight text-slate-100">
              HealthGuard <span className="text-emerald-400">AI</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Verifying clinical authentication session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
