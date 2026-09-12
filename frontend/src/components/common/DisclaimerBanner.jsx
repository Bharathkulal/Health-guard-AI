import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function DisclaimerBanner({ className = "" }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-colors ${
        isDark
          ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-300'
          : 'bg-emerald-50/80 border-emerald-200 text-slate-700'
      } ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className={`text-sm font-semibold tracking-wide ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
            Important Medical & Decision Support Disclaimer
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed opacity-90">
            HealthGuard AI is an educational and decision-support platform designed for early risk assessment. It does <strong>not</strong> provide medical diagnosis, clinical treatment plans, or emergency triage. Always consult qualified healthcare professionals for medical guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
