import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  User,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function MobileNav() {
  const { isDark } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assess', path: '/assessment', icon: ClipboardCheck },
    { name: 'Results', path: '/results', icon: ShieldAlert },
    { name: 'Trends', path: '/trends', icon: TrendingUp },
    { name: 'Guidance', path: '/recommendations', icon: Sparkles },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-2 safe-area-pb transition-all ${
        isDark
          ? 'bg-[#020704]/95 backdrop-blur-xl border-emerald-500/20 shadow-2xl'
          : 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl'
      }`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? isDark
                      ? 'text-emerald-400 font-bold scale-105'
                      : 'text-emerald-700 font-bold scale-105'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
