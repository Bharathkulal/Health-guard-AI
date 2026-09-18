import React from 'react';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';

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
  const selectedSymptoms = data.symptoms || [];
  const isNoneSelected = selectedSymptoms.includes('none') || selectedSymptoms.length === 0;

  const toggleSymptom = (id) => {
    if (id === 'none') {
      onChange({ symptoms: ['none'] });
      return;
    }

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
          <h2 className="text-xl font-bold text-clinical-text flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-clinical-green" />
            <span>Presenting Symptoms & Clinical Sensations</span>
          </h2>
          <p className="text-sm text-clinical-textMuted">
            Select any symptoms you have experienced in the past 30 days. You may select multiple items, or choose "None".
          </p>
        </div>

        {activeSymptomCount > 0 && (
          <button
            type="button"
            onClick={handleSelectNone}
            className="text-xs text-clinical-green hover:text-emerald-700 font-bold underline self-start sm:self-auto"
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
                    ? 'bg-slate-100 border-slate-300 text-clinical-text ring-1 ring-slate-200 shadow-sm'
                    : 'bg-clinical-greenLight border-clinical-green text-clinical-text ring-1 ring-clinical-green/20 shadow-sm'
                  : 'bg-white border-clinical-border text-clinical-text hover:border-clinical-green hover:bg-clinical-greenLight/50'
              }`}
              aria-pressed={isSelected}
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected && !isNoneCard ? 'text-clinical-green' : 'text-clinical-textMuted'}`}>
                  {option.category}
                </span>
                <p className="text-xs sm:text-sm font-bold text-clinical-text">
                  {option.label}
                </p>
                <p className={`text-[11px] leading-snug ${isSelected && !isNoneCard ? 'text-emerald-800' : 'text-clinical-textMuted'}`}>
                  {option.desc}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                  isSelected
                    ? isNoneCard
                      ? 'bg-slate-400 text-white'
                      : 'bg-clinical-green text-white'
                    : 'border-2 border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Notification */}
      <div className="p-4 rounded-xl border flex items-center gap-2.5 text-xs bg-clinical-primary border-clinical-border text-clinical-text">
        <CheckCircle2 className="w-5 h-5 text-clinical-green flex-shrink-0" />
        <span className="font-medium">
          {activeSymptomCount > 0
            ? `${activeSymptomCount} clinical symptom(s) will be structured as individual risk factors for assessment.`
            : 'Currently marked as Asymptomatic (None). No active acute symptoms reported.'}
        </span>
      </div>
    </div>
  );
}
