import React from 'react';
import { User, Info } from 'lucide-react';

export function Step1Demographics({ data, onChange, errors = {} }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-clinical-text flex items-center gap-2">
          <User className="w-5 h-5 text-clinical-green" />
          <span>Basic Demographics</span>
        </h2>
        <p className="text-sm text-clinical-textMuted">
          Age and biological sex provide essential baseline calibrations for metabolic and cardiovascular risk algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Age Input */}
        <div className="space-y-2">
          <label htmlFor="age-input" className="block text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            Age (Years) <span className="text-clinical-green">*</span>
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
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              yrs
            </div>
          </div>
          {errors.age ? (
            <p className="text-xs font-semibold text-rose-500">{errors.age}</p>
          ) : (
            <p className="text-xs text-clinical-textMuted flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-clinical-green" />
              <span>Standard assessment calibration is designed for adults 18+</span>
            </p>
          )}
        </div>

        {/* Biological Sex Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            Biological Sex <span className="text-clinical-green">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
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
                  className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-clinical-green text-white border-emerald-700 shadow-sm'
                      : 'bg-white border-clinical-border text-clinical-text hover:border-clinical-green hover:bg-clinical-greenLight/50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-clinical-textMuted">
            Utilized strictly for physiological reference range normalization.
          </p>
        </div>
      </div>
    </div>
  );
}
