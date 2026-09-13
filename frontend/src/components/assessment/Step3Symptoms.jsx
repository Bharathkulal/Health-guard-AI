import React from 'react';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SYMPTOM_OPTIONS = [
  { id: 'fatigue', label: 'Persistent Fatigue / Low Energy', category: 'Metabolic / General' },
  { id: 'excessive_thirst', label: 'Excessive Thirst (Polydipsia)', category: 'Glycemic' },
  { id: 'frequent_urination', label: 'Frequent Urination (Polyuria)', category: 'Glycemic' },
  { id: 'chest_discomfort', label: 'Chest Discomfort / Tightness', category: 'Cardiovascular' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath on Exertion', category: 'Cardiorespiratory' },
  { id: 'dizziness', label: 'Dizziness or Lightheadedness', category: 'Vascular' },
  { id: 'headache', label: 'Morning Headaches or Tension', category: 'Hypertensive' },
  { id: 'blurred_vision', label: 'Episodes of Blurred Vision', category: 'Glycemic / Vascular' },
  { id: 'palpitations', label: 'Heart Palpitations / Irregular Beats', category: 'Cardiovascular' },
];

export function Step3Symptoms({ data, onChange }) {
  const { isDark } = useTheme();
  const selectedSymptoms = data.symptoms || [];

  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      onChange({ symptoms: selectedSymptoms.filter((s) => s !== id) });
    } else {
      onChange({ symptoms: [...selectedSymptoms, id] });
    }
  };

  const clearSymptoms = () => {
    onChange({ symptoms: [] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-400" />
            <span>Presenting Symptoms & Sensations</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select any recurring symptoms experienced in the last 30 days. Multiple items may be selected.
          </p>
        </div>

        {selectedSymptoms.length > 0 && (
          <button
            type="button"
            onClick={clearSymptoms}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline self-start sm:self-auto"
          >
            Clear all ({selectedSymptoms.length} selected)
          </button>
        )}
      </div>

      {/* Symptom Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {SYMPTOM_OPTIONS.map((option) => {
          const isSelected = selectedSymptoms.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleSymptom(option.id)}
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
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400/80 text-[10px]">
                  {option.category}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                  {option.label}
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

      {/* No symptoms quick option */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={clearSymptoms}
          className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
            selectedSymptoms.length === 0
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          ✓ Currently Asymptomatic (No active symptoms to report)
        </button>
      </div>
    </div>
  );
}
