import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon = Sparkles,
  title = 'No Data Available',
  description = 'Complete your first health assessment to view personalized risk stratifications and insights.',
  actionText = 'Start Assessment',
  actionHref = '/assessment',
  onAction = null,
  className = '',
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`p-8 sm:p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-5 ${
        isDark
          ? 'bg-[#07130e]/60 border-emerald-500/15'
          : 'bg-white/90 border-slate-200 shadow-sm'
      } ${className}`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
          isDark
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}
      >
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>
      </div>

      {actionText && (
        <div className="pt-2">
          {onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-emerald-soft"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-emerald-soft"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
