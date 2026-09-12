import React from 'react';
import { Activity, Shield, Cpu, Database, HeartPulse } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      className={`border-t transition-colors ${
        isDark ? 'bg-[#020604] border-emerald-500/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-base tracking-tight">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>HealthGuard</span>
                <span className="text-emerald-500 ml-1">AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Intelligent early health risk assessment and transparent decision-support powered by explainable AI.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/Bharathkulal/Health-guard-AI"
                target="_blank"
                rel="noreferrer"
                className={`p-2 rounded-full border transition-colors ${
                  isDark
                    ? 'border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/40'
                    : 'border-slate-300 text-slate-700 hover:text-emerald-700 hover:border-emerald-600'
                }`}
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Technology Architecture */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Architecture & Stack
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                <span>FastAPI + Python ML Core</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>SHAP Feature Attribution</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>MongoDB Longitudinal Store</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                <span>React 18 + Vite Frontend</span>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#hero" className="hover:text-emerald-400 transition-colors">Hero Intelligence Core</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Signals & Telemetry</a></li>
              <li><a href="#pipeline" className="hover:text-emerald-400 transition-colors">AI Analysis Pipeline</a></li>
              <li><a href="#explainable-ai" className="hover:text-emerald-400 transition-colors">Explainable AI (SHAP)</a></li>
              <li><a href="#dashboard-preview" className="hover:text-emerald-400 transition-colors">Interactive Dashboard</a></li>
            </ul>
          </div>

          {/* Clinical & Ethics Statement */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Ethical Standards
            </h4>
            <p className="text-xs leading-relaxed">
              Designed according to non-invasive early assessment standards and transparent algorithmic explainability principles.
            </p>
            <div className="mt-3 py-1 px-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] inline-block font-mono">
              Decision Support • Not Medical Diagnosis
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? 'border-emerald-500/10 text-slate-500' : 'border-slate-200 text-slate-500'
        }`}>
          <p>© {new Date().getFullYear()} HealthGuard AI. Open Research & Decision Support Project.</p>
          <div className="flex items-center gap-4">
            <span>Built with precision for early health risk awareness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
