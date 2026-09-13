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

  const activityOptions = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little to no structured exercise' },
    { id: 'light', label: 'Light Activity', desc: '1-2 days/wk light walking or yoga' },
    { id: 'moderate', label: 'Moderate Active', desc: '3-4 days/wk moderate cardio or resistance' },
    { id: 'active', label: 'Active', desc: '5+ days/wk regular athletic training' },
  ];

  const smokingOptions = [
    { id: 'never', label: 'Never Smoked' },
    { id: 'former', label: 'Former Smoker (Quit >1 yr)' },
    { id: 'occasional', label: 'Occasional / Social' },
    { id: 'regular', label: 'Regular Smoker' },
  ];

  const alcoholOptions = [
    { id: 'none', label: 'None / Teetotaler' },
    { id: 'occasional', label: 'Occasional (<2 drinks/wk)' },
    { id: 'moderate', label: 'Moderate (3-7 drinks/wk)' },
    { id: 'heavy', label: 'Frequent (8+ drinks/wk)' },
  ];

  const dietOptions = [
    { id: 'balanced', label: 'Balanced Whole Foods', desc: 'Lean proteins, vegetables, whole grains' },
    { id: 'mediterranean', label: 'Mediterranean Style', desc: 'Olive oil, fish, legumes, fresh produce' },
    { id: 'plant_based', label: 'Plant-Based / Vegetarian', desc: 'Predominantly plant proteins & fibers' },
    { id: 'high_sodium', label: 'Higher Sodium / Processed', desc: 'Frequent restaurant/packaged foods' },
    { id: 'high_sugar', label: 'Elevated Sugars / Refined', desc: 'Sweetened drinks & refined carbs' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <span>Lifestyle & Behavioral Patterns</span>
        </h2>
        <p className="text-xs text-slate-400">
          Lifestyle habits directly modulate endothelial tone, glycemic dynamics, and neuroendocrine stress responses.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Physical Activity */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Physical Activity Baseline
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {activityOptions.map((opt) => {
              const isSelected = lifestyle.physicalActivity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFieldChange('physicalActivity', opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-900/80' : 'text-slate-400'}`}>
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
              Tobacco / Smoking History
            </label>
            <div className="grid grid-cols-2 gap-2">
              {smokingOptions.map((opt) => {
                const isSelected = lifestyle.smoking === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFieldChange('smoking', opt.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : isDark
                        ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alcohol */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Alcohol Consumption
            </label>
            <div className="grid grid-cols-2 gap-2">
              {alcoholOptions.map((opt) => {
                const isSelected = lifestyle.alcohol === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFieldChange('alcohol', opt.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : isDark
                        ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sleep Duration Slider / Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Average Nightly Sleep Duration</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {lifestyle.sleepHours || 7} Hours
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Moon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={lifestyle.sleepHours || 7}
              onChange={(e) => handleFieldChange('sleepHours', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">12 hrs</span>
          </div>
        </div>

        {/* Diet Pattern */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Primary Dietary Pattern
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {dietOptions.map((opt) => {
              const isSelected = lifestyle.dietPattern === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFieldChange('dietPattern', opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-900/80' : 'text-slate-400'}`}>
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
