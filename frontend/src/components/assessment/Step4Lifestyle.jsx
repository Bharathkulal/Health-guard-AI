import React from 'react';
import { Zap, Moon, Flame, Wine, Salad, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Step4Lifestyle({ data, onChange }) {
  const { isDark } = useTheme();
  const lifestyle = data.lifestyle || {};

  const handleFieldChange = (field, value) => {
    onChange({
      lifestyle: {
        ...lifestyle,
        [field]: value,
      },
    });
  };

  // Structured ML-friendly options
  const activityOptions = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little or no routine physical activity' },
    { id: 'light', label: 'Light', desc: '1–2 days/wk of light walking or stretching' },
    { id: 'moderate', label: 'Moderate', desc: '3–4 days/wk of moderate cardio or training' },
    { id: 'active', label: 'Active', desc: '5+ days/wk of vigorous athletic exercise' },
  ];

  const smokingOptions = [
    { id: 'never', label: 'Never', desc: 'Non-smoker' },
    { id: 'former', label: 'Former', desc: 'Quit smoking >1 yr ago' },
    { id: 'current', label: 'Current', desc: 'Regular or daily smoker' },
  ];

  const alcoholOptions = [
    { id: 'never', label: 'Never', desc: 'Zero alcohol consumption' },
    { id: 'occasionally', label: 'Occasionally', desc: 'Social or <3 drinks/week' },
    { id: 'frequently', label: 'Frequently', desc: 'Regular / >4 drinks/week' },
  ];

  const dietOptions = [
    { id: 'balanced', label: 'Balanced', desc: 'Whole foods, balanced proteins & veggies' },
    { id: 'high_carbohydrate', label: 'High Carbohydrate', desc: 'Grain-dense, refined starches or breads' },
    { id: 'high_fat', label: 'High Fat', desc: 'Rich in saturated oils, butter, or fried items' },
    { id: 'high_sugar', label: 'High Sugar', desc: 'Frequent sweetened drinks, desserts, or snacks' },
    { id: 'mixed', label: 'Mixed', desc: 'Varied standard omnivorous diet' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <span>Lifestyle & Behavioral Factors</span>
        </h2>
        <p className="text-xs text-slate-400">
          Daily lifestyle metrics provide essential feature inputs for cardiovascular and metabolic risk stratification.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Physical Activity */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Physical Activity Level <span className="text-emerald-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {activityOptions.map((opt) => {
              const isSelected = (lifestyle.physical_activity || lifestyle.physicalActivity || 'moderate') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFieldChange('physicalActivity', opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-900/90 font-medium' : 'text-slate-400'}`}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smoking & Alcohol Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Smoking */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Smoking Status <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {smokingOptions.map((opt) => {
                const currentVal = lifestyle.smoking || 'never';
                const isSelected = currentVal === opt.id || (opt.id === 'former' && currentVal.includes('former')) || (opt.id === 'current' && (currentVal === 'regular' || currentVal === 'current'));
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFieldChange('smoking', opt.id)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-emerald-soft'
                        : isDark
                        ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alcohol */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Alcohol Consumption <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {alcoholOptions.map((opt) => {
                const currentVal = lifestyle.alcohol || 'occasionally';
                const isSelected = currentVal === opt.id || (opt.id === 'never' && (currentVal === 'none' || currentVal === 'never')) || (opt.id === 'occasionally' && currentVal === 'occasional') || (opt.id === 'frequently' && (currentVal === 'heavy' || currentVal === 'frequently'));
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFieldChange('alcohol', opt.id)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-emerald-soft'
                        : isDark
                        ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sleep Duration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Average Sleep Duration <span className="text-emerald-400">*</span></span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {lifestyle.sleep_hours || lifestyle.sleepHours || 7} Hours / night
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Moon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input
              type="range"
              min="3"
              max="14"
              step="0.5"
              value={lifestyle.sleep_hours || lifestyle.sleepHours || 7}
              onChange={(e) => handleFieldChange('sleepHours', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">14 hrs</span>
          </div>
        </div>

        {/* Diet */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Primary Diet Pattern <span className="text-emerald-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {dietOptions.map((opt) => {
              const currentDiet = lifestyle.diet || lifestyle.dietPattern || 'balanced';
              const isSelected = currentDiet === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFieldChange('dietPattern', opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-900/90 font-medium' : 'text-slate-400'}`}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
