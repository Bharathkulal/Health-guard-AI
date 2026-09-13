import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  User,
  Settings,
  Activity,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../context/HealthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export function Sidebar({ className = '' }) {
  const { isDark } = useTheme();
  const { user } = useHealth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Health Assessment', path: '/assessment', icon: ClipboardCheck },
    { name: 'Risk Results', path: '/results', icon: ShieldAlert },
    { name: 'Health Trends', path: '/trends', icon: TrendingUp },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 h-screen flex flex-col justify-between border-r fixed left-0 top-0 z-30 transition-all duration-300 ${
        isDark
          ? 'bg-[#020704]/90 backdrop-blur-xl border-emerald-500/15'
          : 'bg-white/95 backdrop-blur-xl border-slate-200'
      } ${className}`}
    >
      {/* Top Header / Brand */}
      <div>
        <div className="p-5 border-b border-emerald-500/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-emerald-400">
              <Activity className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight flex items-center gap-1.5">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>HealthGuard</span>
                <span className="text-emerald-500 font-extrabold text-xs px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight">Clinical Decision Support</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? isDark
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-emerald-950/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Session Controls */}
      <div className="p-3 border-t border-emerald-500/10 space-y-2">
        {/* User Mini Card */}
        <Link
          to="/profile"
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
            isDark
              ? 'bg-[#06140d]/60 border-emerald-500/15 hover:border-emerald-500/30'
              : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AC'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-slate-100 truncate">
                {user?.name || 'Alex Chen'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'alex.chen@healthguard.ai'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </Link>

        {/* Footer controls: Theme toggle + Exit to Landing */}
        <div className="flex items-center justify-between px-1 pt-1">
          <ThemeToggle />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-950/20"
            title="Return to Public Landing Page"
          >
            <span>Landing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
