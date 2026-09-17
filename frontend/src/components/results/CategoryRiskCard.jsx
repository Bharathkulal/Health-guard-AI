import React from 'react';
import { Activity, Heart, Droplets, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { RiskBadge } from '../common/RiskBadge';

export function CategoryRiskCard({ category, className = '' }) {
  const { isDark } = useTheme();
  if (!category) return null;

  const { id, name, score, level, summary, keyDrivers = [], previousScore } = category;

  const icons = {
    heart: Heart,
    diabetes: Droplets,
    cardiovascular: Heart,
    hypertension: Activity,
  };

  const Icon = icons[id] || Activity;

  // Determine progress bar color
  const getBarColor = (sc) => {
    if (sc < 30) return 'bg-emerald-500';
    if (sc < 60) return 'bg-amber-500';
    if (sc < 80) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const delta = previousScore && previousScore !== '--' ? score - parseInt(previousScore, 10) : 0;

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 glass-panel-interactive flex flex-col justify-between ${
        isDark
          ? 'bg-[#07130e]/80 border-emerald-500/20 hover:border-emerald-500/40'
          : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
      } ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {name}
              </h3>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <span>{category.model_name || 'Scikit-Learn'} v{category.model_version || '1.0'}</span>
                {category.model_roc_auc && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    AUC: {typeof category.model_roc_auc === 'number' ? category.model_roc_auc.toFixed(2) : category.model_roc_auc}
                  </span>
                )}
              </p>
            </div>
          </div>

          <RiskBadge level={level} size="sm" />
        </div>

        {/* Score & Progress Bar */}
        <div className="space-y-2 my-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-100 font-mono">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>

            {previousScore && previousScore !== '--' && (
              <div className="flex items-center gap-1 text-xs font-mono">
                {delta < 0 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {Math.abs(delta)} pts (Improved)
                  </span>
                ) : delta > 0 ? (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{delta} pts (Elevated)
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <Minus className="w-3 h-3" />
                    Unchanged
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(score)} transition-all duration-700 ease-out rounded-full`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {summary}
        </p>
      </div>

      {/* Key Contributing Drivers */}
      {keyDrivers.length > 0 && (
        <div className="pt-3 border-t border-emerald-500/10 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Primary Determinants:
          </span>
          <div className="space-y-1">
            {keyDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                <span className="truncate">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
