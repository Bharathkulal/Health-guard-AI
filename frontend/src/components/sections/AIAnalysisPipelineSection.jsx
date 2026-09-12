import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Filter, Cpu, CheckCircle2, ChevronRight, BarChart3, Binary, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function AIAnalysisPipelineSection() {
  const { isDark } = useTheme();
  const [activeStage, setActiveStage] = useState(2);

  const pipelineStages = [
    {
      step: '01',
      title: 'Biometric Intake & Validation',
      icon: Database,
      tag: 'Sanitization',
      desc: 'Validates physiological thresholds via Pydantic schemas to ensure clean, bounded inputs.',
    },
    {
      step: '02',
      title: 'Feature Normalization',
      icon: Filter,
      tag: 'Engineering',
      desc: 'Robust scaling, one-hot encoding, and interaction terms (e.g. pulse pressure & metabolic indices).',
    },
    {
      step: '03',
      title: 'ML Ensemble Evaluation',
      icon: Cpu,
      tag: 'Inference',
      desc: 'Parallel evaluation across candidate classifiers selected via cross-validated clinical ROC-AUC.',
    },
    {
      step: '04',
      title: 'SHAP Explainability & Risk Output',
      icon: BarChart3,
      tag: 'Attribution',
      desc: 'Computes local Shapley values to produce transparent factor breakdown and stratified risk scoring.',
    },
  ];

  const candidateModels = [
    {
      name: 'Logistic Regression',
      type: 'Linear Probabilistic Classifier',
      status: 'Planned Baseline',
      metric: 'Interpretability Benchmark',
      highlight: 'Calibrated Odds Ratios',
    },
    {
      name: 'Random Forest',
      type: 'Bagged Decision Ensemble',
      status: 'Planned Non-Linear',
      metric: 'Robust Non-Linear Modeling',
      highlight: 'Out-of-Bag Validation',
    },
    {
      name: 'XGBoost',
      type: 'Gradient Boosted Decision Trees',
      status: 'Planned Primary Candidate',
      metric: 'Target ROC-AUC Optimizer',
      highlight: 'High-Precision Sensitivity',
    },
  ];

  return (
    <section id="pipeline" className="py-24 relative overflow-hidden bg-emerald-950/10 border-y border-emerald-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>Scene 03 • Machine Learning Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span>From Health Data</span><br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              To Meaningful Insight.
            </span>
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            HealthGuard AI replaces opaque heuristics with a disciplined, metric-driven machine learning pipeline engineered specifically for early clinical screening.
          </p>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = activeStage === idx;

            return (
              <div
                key={stage.step}
                onClick={() => setActiveStage(idx)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                  isCurrent
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-400 shadow-emerald-soft'
                      : 'bg-emerald-50 border-emerald-500 shadow-glass-light'
                    : isDark
                      ? 'bg-[#07130e]/80 border-emerald-500/15 hover:border-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                      STEP {stage.step}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {stage.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-100">
                      {stage.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">Stage {idx + 1} of 4</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidate Model Comparison Panel */}
        <div className={`rounded-3xl p-6 sm:p-8 border ${
          isDark ? 'bg-[#07140f]/90 border-emerald-500/20' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-emerald-500/15">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                <Binary className="w-4 h-4" />
                <span>Multi-Model Evaluation Framework</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Rigorous Metric Selection (Not Blind Complexity)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evaluated on Recall, Precision, ROC-AUC & Brier Calibration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidateModels.map((model) => (
              <div
                key={model.name}
                className={`rounded-2xl p-5 border transition-all ${
                  isDark ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {model.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {model.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">
                  {model.type}
                </p>

                <div className="space-y-2 pt-3 border-t border-emerald-500/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Benchmark:</span>
                    <span className="text-emerald-300 font-medium">{model.metric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Key Advantage:</span>
                    <span className="text-slate-200 font-medium">{model.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-slate-400 text-center">
            Models will be serialized and deployed based on empirical cross-validation scorecards with zero clinical overclaiming.
          </p>
        </div>

      </div>
    </section>
  );
}
