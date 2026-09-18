import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Salad,
  Activity,
  Moon,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { EmptyState } from '../components/common/EmptyState';

export function RecommendationsPage() {
  const { isDark } = useTheme();
  const { latestResult } = useHealth();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Guidance', icon: Sparkles },
    { id: 'lifestyle', label: 'Lifestyle & Sleep', icon: Moon },
    { id: 'nutrition', label: 'Nutrition & Diet', icon: Salad },
    { id: 'activity', label: 'Physical Activity', icon: Zap },
    { id: 'monitoring', label: 'Biomarker Monitoring', icon: Activity },
    { id: 'clinical', label: 'Professional Follow-up', icon: Stethoscope },
  ];

  const recommendations = latestResult?.recommendations || [];

  const filteredRecs = activeCategory === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === activeCategory);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'lifestyle': return Moon;
      case 'nutrition': return Salad;
      case 'activity': return Zap;
      case 'monitoring': return Activity;
      case 'clinical': return Stethoscope;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
        <div className="space-y-1.5">
          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDark
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-[#E8F2ED] border border-[#16805F]/15 text-[#16805F]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preventive Wellness Guidance</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
            Personalized Action Plan
          </h1>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
            Targeted preventive interventions derived from your latest risk assessment biomarkers.
          </p>
        </div>

        {/* Category Pills */}
        <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border text-xs font-semibold ${
          isDark
            ? 'bg-slate-900/60 border-emerald-500/15'
            : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-xs'
        }`}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500 text-black font-bold shadow-emerald-soft'
                      : 'bg-[#16805F] text-white font-bold shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/30'
                    : 'text-[#66706A] hover:text-[#18201C] hover:bg-[#F7F4EE]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guidance Cards Grid */}
      {filteredRecs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRecs.map((rec) => {
            const Icon = getCategoryIcon(rec.category);
            const isHigh = rec.priority === 'high';

            return (
              <div
                key={rec.id}
                className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                  isDark
                    ? 'bg-[#07130e]/80 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-[#FFFDF9] border-[#E5E0D7] hover:border-[#16805F]/30 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Category & Priority Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDark
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-[#E8F2ED] border border-[#16805F]/15 text-[#16805F]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
                        {rec.category}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isHigh
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : rec.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-[#E8F2ED] text-[#16805F] border-[#16805F]/20'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
                      {rec.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#66706A]'}`}>
                      {rec.description}
                    </p>
                  </div>

                  {/* Actionable Steps */}
                  {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                    <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
                      <span className={`text-[11px] uppercase font-bold tracking-wider block ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
                        Actionable Protocol:
                      </span>
                      <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                        {rec.actionableSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${
                  isDark
                    ? 'border-emerald-500/10 text-slate-400 font-mono'
                    : 'border-[#E5E0D7] text-[#66706A]'
                }`}>
                  <span className="font-semibold">Preventive Target</span>
                  <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>Evidence Grade A</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No Recommendations Found"
          description="Complete a risk assessment to receive prioritized personalized recommendations."
          actionText="Start Assessment"
          actionHref="/assessment"
        />
      )}

      {/* Clinical Guidance Footnote */}
      <div
        className={`p-6 rounded-3xl border flex items-start gap-4 text-xs ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-300'
            : 'bg-[#FFFDF9] border-[#E5E0D7] text-[#66706A] shadow-sm'
        }`}
      >
        <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />
        <p className="leading-relaxed">
          <strong className={isDark ? 'text-slate-100' : 'text-[#18201C]'}>Important Clinical Note:</strong> The guidance above represents general, evidence-informed preventive lifestyle and monitoring suggestions. These recommendations do not constitute personalized medical prescriptions or diagnostic treatment plans. Always consult your primary care physician before beginning new vigorous exercise or dietary alterations.
        </p>
      </div>
    </div>
  );
}
