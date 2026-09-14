import React from 'react';
import { Users, Shield, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Step5FamilyHistory({ data, onChange }) {
  const { isDark } = useTheme();
  const history = data.familyHistory || {};

  const setCondition = (key, value) => {
    onChange({
      familyHistory: {
        ...history,
        [key]: value,
      },
    });
  };

  const familyConditions = [
    {
      key: 'diabetes',
      label: 'Type 2 Diabetes',
      desc: 'First-degree relative (parents, siblings) diagnosed with diabetes',
      category: 'Metabolic Heredity',
    },
    {
      key: 'hypertension',
      label: 'Hypertension (High Blood Pressure)',
      desc: 'Chronic hypertension requiring prescription therapy in immediate family',
      category: 'Vascular Heredity',
    },
    {
      key: 'heart_disease',
      label: 'Heart Disease / Coronary Artery Disease',
      desc: 'History of myocardial infarction, coronary bypass, stent, or stroke',
      category: 'Cardiovascular Heredity',
    },
    {
      key: 'early_heart_attack',
      label: 'Premature Cardiac Event (<55 yrs)',
      desc: 'Early cardiovascular event in male relative <55 or female relative <65',
      category: 'High-Risk Heredity',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Family Health & Hereditary Indicators</span>
        </h2>
        <p className="text-xs text-slate-400">
          Hereditary factors establish baseline susceptibility for chronic cardiometabolic conditions.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {familyConditions.map((item) => {
          const isPositive = Boolean(history[item.key] ?? (item.key === 'heart_disease' ? history.cardiovascular : (item.key === 'early_heart_attack' ? history.earlyHeartAttack : false)));

          return (
            <div
              key={item.key}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isPositive
                  ? isDark
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : 'bg-emerald-50/70 border-emerald-300'
                  : isDark
                  ? 'bg-slate-900/60 border-emerald-500/15'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  {item.category}
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  {item.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Clean Yes / No Toggle Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCondition(item.key, false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !isPositive
                      ? isDark
                        ? 'bg-slate-800 text-slate-200 border border-slate-600 shadow-sm'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>No</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition(item.key, true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isPositive
                      ? 'bg-emerald-500 text-black border border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'border border-emerald-500/20 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                      : 'border border-slate-300 text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Yes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400'
            : 'bg-emerald-50/80 border-emerald-200 text-slate-700'
        }`}
      >
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          If you are unsure of specific conditions in extended relatives, leave the selection as &quot;No&quot;.
        </span>
      </div>
    </div>
  );
}
