import React from 'react';
import { Activity, CheckCircle2, AlertCircle, ShieldAlert, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SYMPTOM_OPTIONS = [
  { id: 'fatigue', label: 'Fatigue', desc: 'Persistent low energy or exhaustion', category: 'Metabolic' },
  { id: 'excessive_thirst', label: 'Excessive Thirst', desc: 'Polydipsia / constant dry throat', category: 'Glycemic' },
  { id: 'frequent_urination', label: 'Frequent Urination', desc: 'Polyuria / frequent nighttime waking', category: 'Glycemic' },
  { id: 'increased_hunger', label: 'Increased Hunger', desc: 'Polyphagia / persistent appetite after meals', category: 'Metabolic' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath', desc: 'Dyspnea on light exertion or rest', category: 'Cardiorespiratory' },
  { id: 'chest_discomfort', label: 'Chest Discomfort', desc: 'Tightness, pressure, or dull ache', category: 'Cardiovascular' },
  { id: 'dizziness', label: 'Dizziness', desc: 'Lightheadedness or postural unsteadiness', category: 'Vascular' },
  { id: 'headache', label: 'Headache', desc: 'Frequent morning or tension headaches', category: 'Hypertensive' },
  { id: 'swelling', label: 'Swelling', desc: 'Peripheral edema in ankles, feet, or hands', category: 'Vascular' },
  { id: 'none', label: 'None (Asymptomatic)', desc: 'No active symptoms to report currently', category: 'General' },
];

export function Step3Symptoms({ data, onChange }) {
  const { isDark } = useTheme();
  const selectedSymptoms = data.symptoms || [];

  const isNoneSelected = selectedSymptoms.includes('none') || selectedSymptoms.length === 0;

  const toggleSymptom = (id) => {
    if (id === 'none') {
      // If clicking "None", reset to empty/none
      onChange({ symptoms: ['none'] });
      return;
    }

    // If selecting any active symptom, remove 'none'
    const withoutNone = selectedSymptoms.filter((s) => s !== 'none');

    if (withoutNone.includes(id)) {
      const next = withoutNone.filter((s) => s !== id);
      onChange({ symptoms: next.length === 0 ? ['none'] : next });
    } else {
      onChange({ symptoms: [...withoutNone, id] });
    }
  };

  const handleSelectNone = () => {
    onChange({ symptoms: ['none'] });
  };

  const activeSymptomCount = selectedSymptoms.filter((s) => s !== 'none').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-400" />
            <span>Presenting Symptoms & Clinical Sensations</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select any symptoms you have experienced in the past 30 days. You may select multiple items, or choose &quot;None&quot;.
          </p>
        </div>

        {activeSymptomCount > 0 && (
          <button
            type="button"
            onClick={handleSelectNone}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline self-start sm:self-auto"
          >
            Clear and set to None ({activeSymptomCount} selected)
          </button>
        )}
      </div>

      {/* Symptom Multi-Select Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {SYMPTOM_OPTIONS.map((option) => {
          const isSelected = option.id === 'none'
            ? selectedSymptoms.includes('none') || selectedSymptoms.length === 0
            : selectedSymptoms.includes(option.id) && !selectedSymptoms.includes('none');

          const isNoneCard = option.id === 'none';

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleSymptom(option.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between gap-3 ${
                isSelected
                  ? isNoneCard
                    ? isDark
                      ? 'bg-slate-800/80 border-slate-500 text-slate-100 ring-1 ring-slate-400/30'
                      : 'bg-slate-100 border-slate-400 text-slate-900'
                    : isDark
                    ? 'bg-emerald-950/40 border-emerald-400 text-slate-100 shadow-emerald-soft ring-1 ring-emerald-400/40'
                    : 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-950/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
              }`}
              aria-pressed={isSelected}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
                  {option.category}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                  {option.label}
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {option.desc}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                  isSelected
                    ? isNoneCard
                      ? 'bg-slate-400 text-black'
                      : 'bg-emerald-500 text-black'
                    : 'border border-slate-600 bg-slate-800/40'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Notification */}
      <div
        className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
          isDark
            ? 'bg-slate-900/50 border-emerald-500/15 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          {activeSymptomCount > 0
            ? `${activeSymptomCount} clinical symptom(s) will be structured as individual risk factors for assessment.`
            : 'Currently marked as Asymptomatic (None). No active acute symptoms reported.'}
        </span>
      </div>
    </div>
  );
}
