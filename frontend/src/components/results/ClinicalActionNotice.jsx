import React from 'react';
import { AlertTriangle, Stethoscope, PhoneCall, CheckSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ClinicalActionNotice({ className = '' }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDark
          ? 'bg-gradient-to-br from-amber-950/20 via-[#07130e] to-[#040d08] border-amber-500/25'
          : 'bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-amber-200'
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">
            When to Seek Professional Medical Care
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            HealthGuard AI is an analytical early-warning decision-support tool. It is not an emergency triage service or diagnostic platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Urgent Attention Conditions */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Immediate / Urgent Clinical Care</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            Seek immediate medical attention or emergency services if you experience any of the following:
          </p>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Crushing or radiating chest pain, pressure, or tightness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Sudden severe shortness of breath or difficulty breathing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Sudden numbness or weakness in the face, arm, or leg</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Systolic BP &gt; 180 mmHg or Diastolic BP &gt; 120 mmHg</span>
            </li>
          </ul>
        </div>

        {/* Routine Doctor Discussion */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider mb-2">
            <CheckSquare className="w-4 h-4" />
            <span>Routine Primary Care Consultation</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            Discuss your HealthGuard AI risk summary with your physician if you note:
          </p>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Consistent pre-hypertensive or hypertensive blood pressure readings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Fasting blood glucose consistently above 100 mg/dL</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Unexplained persistent fatigue, polydipsia, or sleep disruption</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Family history of early cardiovascular disease or diabetes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
