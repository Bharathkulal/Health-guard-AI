import React from 'react';
import { User, Calendar, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Step1Demographics({ data, onChange, errors = {} }) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>Basic Demographics</span>
        </h2>
        <p className="text-xs text-slate-400">
          Age and biological sex provide essential baseline calibrations for metabolic and cardiovascular risk algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Age Input */}
        <div className="space-y-2">
          <label htmlFor="age-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Age (Years) <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <input
              id="age-input"
              type="number"
              min="18"
              max="120"
              value={data.age || ''}
              onChange={(e) => onChange({ age: parseInt(e.target.value, 10) || '' })}
              placeholder="e.g. 38"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.age
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              yrs
            </div>
          </div>
          {errors.age ? (
            <p className="text-xs text-rose-400">{errors.age}</p>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-emerald-400" />
              <span>Standard assessment calibration is designed for adults 18+</span>
            </p>
          )}
        </div>

        {/* Biological Sex Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Biological Sex <span className="text-emerald-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'other', label: 'Other / Non-Binary' },
            ].map((option) => {
              const isSelected = data.sex === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ sex: option.id })}
                  className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-soft'
                      : isDark
                      ? 'bg-slate-900/60 border-emerald-500/15 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-950/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            Utilized strictly for physiological reference range normalization.
          </p>
        </div>
      </div>
    </div>
  );
}
