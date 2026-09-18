import React from 'react';
import { Activity, Heart, Droplets, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export function CategoryRiskCard({ category, className = '' }) {
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
    if (sc < 30) return 'bg-[#16805F]';
    if (sc < 70) return 'bg-[#B7791F]';
    return 'bg-[#C24141]';
  };

  const delta = previousScore && previousScore !== '--' ? score - parseInt(previousScore, 10) : 0;

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#16805F]/30 ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E8F2ED] border border-[#16805F]/10 text-[#16805F]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18201C] tracking-tight">
                {name}
              </h3>
              <p className="text-[10px] text-[#66706A] font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span>{category.model_name || 'Scikit-Learn'} v{category.model_version || '1.0'}</span>
                {category.model_roc_auc && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5E0D7]/50 text-[#18201C]">
                    AUC: {typeof category.model_roc_auc === 'number' ? category.model_roc_auc.toFixed(2) : category.model_roc_auc}
                  </span>
                )}
              </p>
            </div>
          </div>

          <RiskBadge level={level} size="sm" />
        </div>

        {/* Score & Progress Bar */}
        <div className="space-y-3 my-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#18201C]">
                {score}
              </span>
              <span className="text-xs font-bold text-[#66706A] uppercase tracking-wide">/ 100</span>
            </div>

            {previousScore && previousScore !== '--' && (
              <div className="flex items-center gap-1 text-xs font-bold">
                {delta < 0 ? (
                  <span className="text-[#16805F] flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {Math.abs(delta)} pts (Improved)
                  </span>
                ) : delta > 0 ? (
                  <span className="text-[#B7791F] flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{delta} pts (Elevated)
                  </span>
                ) : (
                  <span className="text-[#66706A] flex items-center gap-0.5">
                    <Minus className="w-3 h-3" />
                    Unchanged
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-2.5 bg-[#E5E0D7] rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(score)} transition-all duration-700 ease-out rounded-full`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
        </div>

        {/* Summary Description */}
        <p className="text-[13px] text-[#66706A] font-medium leading-relaxed mb-4">
          {summary}
        </p>
      </div>

      {/* Key Contributing Drivers */}
      {keyDrivers.length > 0 && (
        <div className="pt-4 border-t border-[#E5E0D7] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A827D] block">
            Primary Determinants:
          </span>
          <div className="space-y-1.5">
            {keyDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#18201C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16805F] flex-shrink-0" />
                <span className="truncate">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
