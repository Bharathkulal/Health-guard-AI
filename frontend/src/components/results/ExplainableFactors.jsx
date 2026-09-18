import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

export function ExplainableFactors({ factors = [], className = '' }) {
  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D7]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#E8F2ED] border border-[#16805F]/10 text-[#16805F] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI Attribution (SHAP)</span>
          </div>
          <h3 className="text-xl font-black text-[#18201C]">
            Why This Risk Level?
          </h3>
          <p className="text-sm font-medium text-[#66706A] mt-1">
            Deconstruction of individual biometric, lifestyle, and genetic inputs driving your personalized risk prediction.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-[#B7791F]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B7791F] inline-block" />
            <span>Elevates Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#16805F]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#16805F] inline-block" />
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
              className={`p-5 rounded-2xl border border-[#E5E0D7] bg-white transition-all hover:shadow-sm hover:border-[#16805F]/30`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-base text-[#18201C]">
                    {factor.feature}
                  </span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#F7F4EE] text-[#66706A] border border-[#E5E0D7]">
                    Value: {factor.value}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                  {isElevating && (
                    <span className="text-[#B7791F] flex items-center gap-1 bg-[#B7791F]/10 px-2 py-1 rounded border border-[#B7791F]/20">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{factor.impact.toFixed(2)} (Elevating)
                    </span>
                  )}
                  {isMitigating && (
                    <span className="text-[#16805F] flex items-center gap-1 bg-[#16805F]/10 px-2 py-1 rounded border border-[#16805F]/20">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {factor.impact.toFixed(2)} (Protective)
                    </span>
                  )}
                  {isNeutral && (
                    <span className="text-[#66706A] flex items-center gap-1 bg-[#F7F4EE] px-2 py-1 rounded border border-[#E5E0D7]">
                      <Minus className="w-3.5 h-3.5" />
                      Neutral Influence
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Visualizer Bar */}
              <div className="w-full bg-[#E5E0D7] rounded-full h-2 my-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isElevating
                      ? 'bg-[#B7791F]'
                      : isMitigating
                      ? 'bg-[#16805F]'
                      : 'bg-[#66706A]'
                  }`}
                  style={{ width: `${Math.max(15, impactPct)}%` }}
                />
              </div>

              {/* Plain-Language Clinical Rationale */}
              <p className="text-[13px] text-[#66706A] font-medium leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
