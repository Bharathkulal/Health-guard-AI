import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function MetricCard({
  label,
  value,
  unit = '',
  status = '',
  statusType = 'normal', // 'normal' | 'warning' | 'alert' | 'neutral'
  icon: Icon,
  targetRange = '',
  className = '',
}) {
  const { isDark } = useTheme();

  const statusStyles = {
    normal: isDark
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    warning: isDark
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-amber-700 bg-amber-50 border-amber-200',
    alert: isDark
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : 'text-rose-700 bg-rose-50 border-rose-200',
    neutral: isDark
      ? 'text-slate-400 bg-slate-800/40 border-slate-700/50'
      : 'text-slate-600 bg-slate-100 border-slate-200',
  }[statusType] || '';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 glass-panel-interactive flex flex-col justify-between ${
        isDark
          ? 'bg-[#07130e]/80 border-emerald-500/15 hover:border-emerald-500/30'
          : 'bg-white/90 border-slate-200 hover:border-emerald-300 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-medium truncate">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-400 font-mono">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-emerald-500/10 flex items-center justify-between gap-2 text-xs">
        {status && (
          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${statusStyles}`}>
            {status}
          </span>
        )}
        {targetRange && (
          <span className="text-[11px] text-slate-400 font-mono ml-auto truncate">
            Target: {targetRange}
          </span>
        )}
      </div>
    </div>
  );
}
