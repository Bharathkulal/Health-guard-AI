import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Activity, Bell, Search, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../context/HealthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export function Topbar({ onMenuClick = null }) {
  const { isDark } = useTheme();
  const { user, latestResult } = useHealth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <header
      className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300 ${
        isDark
          ? 'bg-[#030806]/85 backdrop-blur-md border-emerald-500/15'
          : 'bg-white/85 backdrop-blur-md border-slate-200'
      }`}
    >
      {/* Left: Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <Link to="/" className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
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
          <span>Last assessed: {latestResult?.date || 'Recent'}</span>
        </div>

        {/* Primary CTA (visible when not on assessment page) */}
        {location.pathname !== '/assessment' && (
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all duration-200"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">New Assessment</span>
            <span className="xs:hidden">Assess</span>
          </Link>
        )}

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* User Mini Avatar Badge */}
        <Link
          to="/profile"
          className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400 hover:scale-105 transition-transform"
          title={user?.name || 'User Profile'}
        >
          {user?.name
            ? user.name
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'HG'}
        </Link>
      </div>
    </header>
  );
}
