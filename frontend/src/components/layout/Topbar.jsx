import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Activity, Bell, Search, ShieldCheck, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../context/HealthContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export function Topbar({ onMenuClick = null }) {
  const { isDark } = useTheme();
  const { user: healthUser, latestResult } = useHealth();
  const { user: authUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const user = authUser || healthUser;

  const routeTitles = {
    '/dashboard': { title: 'Health Intelligence Dashboard', subtitle: 'Longitudinal risk stratification & biometric telemetry' },
    '/assessment': { title: 'Health Risk Assessment', subtitle: 'Guided multi-factor clinical indicator collection' },
    '/results': { title: 'Risk Stratification Results', subtitle: 'Explainable AI decomposition & personalized recommendations' },
    '/trends': { title: 'Health Trends & Biometrics', subtitle: 'Multi-assessment historical trajectories & change analysis' },
    '/recommendations': { title: 'Preventive Guidance', subtitle: 'Prioritized lifestyle, nutrition, and monitoring next steps' },
    '/profile': { title: 'Patient Profile & Biometrics', subtitle: 'Demographics, baseline measurements & health markers' },
    '/settings': { title: 'Application Settings', subtitle: 'Preferences, notifications, privacy & local telemetry' },
  };

  const currentMeta = routeTitles[location.pathname] || {
    title: 'HealthGuard AI',
    subtitle: 'Clinical Decision Support System',
  };

  if (!isDark) {
    return (
      <header className="h-16 bg-clinical-primary border-b border-clinical-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-clinical-text hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-6 h-6 text-clinical-green" />
            <span className="font-bold text-lg tracking-tight">HealthGuard AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 ml-4 text-sm font-medium text-clinical-textMuted">
            <Link to="/" className="hover:text-clinical-text transition-colors">Home</Link>
            <Link to="/#how-it-works" className="hover:text-clinical-text transition-colors">How It Works</Link>
            <Link to="/#about" className="hover:text-clinical-text transition-colors">About</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to={user ? "/assessment" : "/login?redirect=/assessment"}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold bg-clinical-green text-white hover:bg-[#126b4f] transition-colors"
          >
            Start Assessment
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-clinical-greenLight border border-clinical-border flex items-center justify-center text-sm font-bold text-clinical-green hover:scale-105 transition-transform"
                title={user.name ? `${user.name} (View Profile)` : 'Profile'}
              >
                {user.name
                  ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'HG'}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-clinical-textMuted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-clinical-text hover:text-clinical-green transition-colors">
              Log in
            </Link>
          )}
        </div>
      </header>
    );
  }

  // Admin / Dark Mode Topbar
  return (
    <header
      className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300 bg-[#030806]/85 backdrop-blur-md border-emerald-500/15`}
    >
      {/* Left: Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <Link to="/admin/dashboard" className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        <div className="hidden sm:block">
          <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="hidden lg:inline text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v2.4 Active
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-normal hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Actions, Notifications, User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status Chip */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Admin System Ready</span>
        </div>

        {/* User Mini Avatar Badge */}
        <div
          className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400"
          title="Admin"
        >
          AD
        </div>
      </div>
    </header>
  );
}
