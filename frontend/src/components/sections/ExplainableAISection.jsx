import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sliders, ShieldAlert, Cpu, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ExplainableAISection() {
  const { isDark } = useTheme();

  // Interactive sandbox state for live SHAP feature attribution
  const [systolicBP, setSystolicBP] = useState(140);
  const [bmi, setBmi] = useState(28.5);
  const [activityDays, setActivityDays] = useState(2);
  const [glucose, setGlucose] = useState(105);

  // Dynamic SHAP value calculation simulation
  const bpShap = ((systolicBP - 120) * 0.015).toFixed(2);
  const bmiShap = ((bmi - 23) * 0.04).toFixed(2);
  const activityShap = (-(activityDays * 0.06)).toFixed(2);
  const glucoseShap = ((glucose - 95) * 0.01).toFixed(2);
  const familyShap = 0.12;

  const features = [
    {
      name: 'Systolic Blood Pressure',
      value: `${systolicBP} mmHg`,
      shap: parseFloat(bpShap),
      desc: systolicBP > 130 ? 'Elevated arterial pressure increases cardiovascular weight' : 'Normal range stabilizes vascular score',
    },
    {
      name: 'Body Mass Index (BMI)',
      value: `${bmi} kg/m²`,
      shap: parseFloat(bmiShap),
      desc: bmi > 25 ? 'Adiposity metric contributes positively to metabolic risk' : 'Optimal range decreases metabolic risk weight',
    },
    {
      name: 'Physical Activity',
      value: `${activityDays} days / week`,
      shap: parseFloat(activityShap),
      desc: activityDays >= 3 ? 'Regular exercise reduces calculated risk profile' : 'Low sedentary offset provides minimal risk reduction',
    },
    {
      name: 'Fasting Blood Sugar',
      value: `${glucose} mg/dL`,
      shap: parseFloat(glucoseShap),
      desc: glucose > 100 ? 'Impaired fasting glucose contributes toward glycemic vector' : 'Euglycemic baseline',
    },
    {
      name: 'Family History Marker',
      value: 'Positive Indicator',
      shap: familyShap,
      desc: 'Genetic predisposition baseline weighting factor',
    },
  ];

  // Dynamic summary sentence
  const strongestPositive = features
    .filter(f => f.shap > 0)
    .sort((a, b) => b.shap - a.shap)[0]?.name || 'Biometric metrics';

  return (
    <section id="explainable-ai" className="py-24 relative overflow-hidden bg-emerald-950/15 border-y border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scene 05 • The Signature Feature</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            <span>Don't Just Get a Prediction.</span><br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Understand Why.
            </span>
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            HealthGuard AI integrates <strong>SHAP (SHapley Additive exPlanations)</strong> to decompose complex machine learning decisions into interpretable, human-readable factor attributions.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-slate-800/40 text-slate-400 border border-slate-700/50">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive SHAP sandbox — adjust sliders below to test feature attributions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Health Metric Sliders */}
          <div className={`lg:col-span-5 rounded-3xl p-6 sm:p-7 border ${
            isDark ? 'bg-[#06120c]/90 border-emerald-500/20' : 'bg-white border-slate-200 shadow-lg'
          }`}>
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-emerald-500/15">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-slate-100">
                Interactive Biometric Simulator
              </h3>
            </div>

            <div className="space-y-6">
              {/* Systolic BP Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-semibold">Systolic BP:</span>
                  <span className="text-emerald-400 font-bold">{systolicBP} mmHg</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="170"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>100 (Optimal)</span>
                  <span>140 (Elevated)</span>
                  <span>170 (Stage 2)</span>
                </div>
              </div>

              {/* BMI Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-semibold">Body Mass Index (BMI):</span>
                  <span className="text-emerald-400 font-bold">{bmi} kg/m²</span>
                </div>
                <input
                  type="range"
                  min="18.5"
                  max="38"
                  step="0.5"
                  value={bmi}
                  onChange={(e) => setBmi(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>18.5 (Normal)</span>
                  <span>25.0 (Overweight)</span>
                  <span>35+ (Obese)</span>
                </div>
              </div>

              {/* Physical Activity Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-semibold">Active Days / Week:</span>
                  <span className="text-emerald-400 font-bold">{activityDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={activityDays}
                  onChange={(e) => setActivityDays(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0 (Sedentary)</span>
                  <span>3 (Moderate)</span>
                  <span>7 (Daily)</span>
                </div>
              </div>

              {/* Fasting Glucose Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-semibold">Fasting Blood Glucose:</span>
                  <span className="text-emerald-400 font-bold">{glucose} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="160"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>75 (Euglycemic)</span>
                  <span>100 (Threshold)</span>
                  <span>160 (Elevated)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/15 text-[11px] text-slate-400">
              Sliders simulate live model input vectors. Notice how SHAP values on the right dynamically shift in real time.
            </div>
          </div>

          {/* Right Column: SHAP Feature Attribution Chart & Explanation Card */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real-time SHAP Waterfall / Feature Contribution Card */}
            <div className={`rounded-3xl p-6 sm:p-7 border ${
              isDark ? 'bg-[#07140e]/95 border-emerald-500/25' : 'bg-white border-slate-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-500/15">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <span>SHAP Local Feature Attribution</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Quantifying relative positive (+) and protective (-) risk impact
                  </span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SHAP v0.45+
                </span>
              </div>

              {/* Dynamic Feature Contribution Bars */}
              <div className="space-y-4">
                {features.map((f) => {
                  const isPositive = f.shap > 0;
                  const magnitude = Math.min(Math.abs(f.shap) * 160, 100);

                  return (
                    <div key={f.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{f.name}</span>
                          <span className="font-mono text-slate-400 text-[11px]">({f.value})</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          {isPositive ? (
                            <span className="text-amber-400 flex items-center">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{f.shap.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              {f.shap.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bar Representation */}
                      <div className="w-full bg-slate-800/80 rounded-full h-2.5 flex overflow-hidden">
                        <motion.div
                          animate={{ width: `${Math.max(magnitude, 4)}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${
                            isPositive
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                        />
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {f.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Synthesized Explanation Card */}
            <div className={`rounded-2xl p-5 border ${
              isDark ? 'bg-emerald-950/30 border-emerald-400/40' : 'bg-emerald-50 border-emerald-400'
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-emerald-400">
                    AI-Generated Factor Summary
                  </h4>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    "{strongestPositive} was the primary factor driving the calculated risk variance in this illustrative assessment, offset by active baseline indicators."
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Model explanation — not a clinical medical diagnosis.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
