import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function DisclaimerCard({ compact = false, className = '' }) {
  const { isDark } = useTheme();

  if (compact) {
    return (
      <div
        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-300'
            : 'bg-emerald-50/80 border-emerald-200 text-slate-700'
        } ${className}`}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-[11px] leading-tight">
          <strong>Decision Support System:</strong> HealthGuard AI delivers early risk stratification and personalized wellness insights. It does not provide medical diagnoses or replace clinical consultation.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3.5 ${
        isDark
          ? 'bg-gradient-to-r from-emerald-950/30 to-[#040d08] border-emerald-500/20 text-slate-300'
          : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 text-slate-700'
      } ${className}`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
          isDark
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-emerald-100 border-emerald-300 text-emerald-700'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Clinical Decision Support Notice
        </h4>
        <p className="text-xs leading-relaxed text-slate-400">
          HealthGuard AI uses statistical machine learning and physiological modeling to identify potential risk patterns for informational and preventive wellness purposes. If you experience acute symptoms or severe biometric elevations, please consult a qualified healthcare professional promptly.
        </p>
      </div>
    </div>
  );
}
