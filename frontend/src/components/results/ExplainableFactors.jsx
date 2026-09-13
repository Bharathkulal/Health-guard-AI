import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ExplainableFactors({ factors = [], className = '' }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDark
          ? 'bg-[#07130e]/80 border-emerald-500/20'
          : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI Attribution (SHAP)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            Why This Risk Level?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deconstruction of individual biometric, lifestyle, and genetic inputs driving your personalized risk prediction.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span>Elevates Risk</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
            <span>Protective / Lowers</span>
          </div>
        </div>
      </div>

      {/* Factors List */}
      <div className="space-y-4">
        {factors.map((factor) => {
          const isElevating = factor.direction === 'elevating';
          const isMitigating = factor.direction === 'mitigating';
          const isNeutral = factor.direction === 'neutral';

          const impactPct = Math.min(100, Math.round(Math.abs(factor.impact) * 200));

          return (
            <div
              key={factor.id || factor.feature}
              className={`p-4 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-slate-900/50 border-emerald-500/10 hover:border-emerald-500/25'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">
                    {factor.feature}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Value: {factor.value}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  {isElevating && (
                    <span className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{factor.impact.toFixed(2)} (Elevating Impact)
                    </span>
                  )}
                  {isMitigating && (
                    <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {factor.impact.toFixed(2)} (Protective / Mitigating)
                    </span>
                  )}
                  {isNeutral && (
                    <span className="text-slate-400 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      <Minus className="w-3.5 h-3.5" />
                      Neutral Influence
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Visualizer Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 my-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isElevating
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : isMitigating
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(15, impactPct)}%` }}
                />
              </div>

              {/* Plain-Language Clinical Rationale */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
