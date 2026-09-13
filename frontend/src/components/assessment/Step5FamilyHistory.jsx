import React from 'react';
import { Users, Shield, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Step5FamilyHistory({ data, onChange }) {
  const { isDark } = useTheme();
  const history = data.familyHistory || {};

  const toggleCondition = (key) => {
    onChange({
      familyHistory: {
        ...history,
        [key]: !history[key],
      },
    });
  };

  const familyConditions = [
    {
      key: 'diabetes',
      label: 'Type 2 Diabetes',
      desc: 'Diagnosed in parents, siblings, or grandparents',
      category: 'Metabolic Heredity',
    },
    {
      key: 'hypertension',
      label: 'Essential Hypertension',
      desc: 'Chronic high blood pressure requiring medication in direct family',
      category: 'Vascular Heredity',
    },
    {
      key: 'cardiovascular',
      label: 'Cardiovascular Disease / Stroke',
      desc: 'History of coronary artery disease, heart failure, or ischemic stroke',
      category: 'Cardiac Heredity',
    },
    {
      key: 'earlyHeartAttack',
      label: 'Premature Cardiac Event (<55 yrs)',
      desc: 'Heart attack, bypass surgery, or stent placed in first-degree relative under 55',
      category: 'High-Risk Heredity',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Hereditary & Family Health History</span>
        </h2>
        <p className="text-xs text-slate-400">
          Genetic predispositions establish foundational risk baselines for diabetes, cardiovascular, and hypertension models.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {familyConditions.map((item) => {
          const isSelected = !!history[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleCondition(item.key)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between gap-3 ${
                isSelected
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-400 text-slate-100 shadow-emerald-soft ring-1 ring-emerald-400/40'
                    : 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-950/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
              }`}
              aria-pressed={isSelected}
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

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-black'
                    : 'border border-slate-600 bg-slate-800/40'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>
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
          If you have no known family history of these conditions, you may proceed directly to the review step.
        </span>
      </div>
    </div>
  );
}
