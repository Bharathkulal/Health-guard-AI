import React from 'react';
import { Users, Shield, Check, X } from 'lucide-react';

export function Step5FamilyHistory({ data, onChange }) {
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
        <h2 className="text-xl font-bold text-clinical-text flex items-center gap-2">
          <Users className="w-5 h-5 text-clinical-green" />
          <span>Family Health & Hereditary Indicators</span>
        </h2>
        <p className="text-sm text-clinical-textMuted">
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
                  ? 'bg-clinical-greenLight border-clinical-green/40 shadow-sm'
                  : 'bg-white border-clinical-border'
              }`}
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isPositive ? 'text-clinical-green' : 'text-clinical-textMuted'}`}>
                  {item.category}
                </span>
                <p className="text-sm font-bold text-clinical-text">
                  {item.label}
                </p>
                <p className={`text-xs leading-relaxed ${isPositive ? 'text-emerald-800' : 'text-clinical-textMuted'}`}>
                  {item.desc}
                </p>
              </div>

              {/* Clean Yes / No Toggle Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCondition(item.key, false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    !isPositive
                      ? 'bg-slate-200 text-slate-800 border border-slate-300 shadow-sm'
                      : 'border border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
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
                      ? 'bg-clinical-green text-white border-emerald-700 shadow-sm'
                      : 'border border-slate-300 text-slate-600 hover:text-clinical-green hover:border-clinical-green hover:bg-clinical-greenLight/50'
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

      <div className="p-4 rounded-xl border flex items-center gap-3 text-xs bg-clinical-primary border-clinical-border text-clinical-text">
        <Shield className="w-5 h-5 text-clinical-green flex-shrink-0" />
        <span className="font-medium">
          If you are unsure of specific conditions in extended relatives, leave the selection as "No".
        </span>
      </div>
    </div>
  );
}
