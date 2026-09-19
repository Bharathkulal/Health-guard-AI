import React from 'react';
import {
  Users,
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  BrainCircuit,
  Server,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function DashboardOverviewView({ stats, assessments = [], models = [], onNavigateTo }) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Dashboard <span className={`font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Overview</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Live telemetry monitoring of patient evaluations, clinical risk distributions, and active ML model pipelines.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SYSTEM READY</span>
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex justify-between items-start mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats?.total_users || 0}</div>
          <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Registered patient profiles</p>
        </div>

        {/* Total Assessments */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex justify-between items-start mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span className="text-xs font-bold uppercase tracking-wider">Total Assessments</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats?.total_assessments || 0}</div>
          <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Clinical ML evaluations</p>
        </div>

        {/* High Risk Detected */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-rose-900/30' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>High Risk Detected</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{stats?.risk_distribution?.High || 0}</div>
          <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Requires clinical attention</p>
        </div>

        {/* Low Risk Clear */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-emerald-900/30' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Low Risk Clear</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats?.risk_distribution?.Low || 0}</div>
          <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Optimal physiological baselines</p>
        </div>
      </div>

      {/* Main Grid: Assessments Log + Active Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table: Recent Assessments Log */}
        <div
          className={`lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-5 border-b border-inherit flex items-center justify-between">
            <h3 className={`font-bold flex items-center gap-2 text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Activity className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Recent Assessments Log
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTo?.('users', 'assessment-history')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b border-inherit text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400 bg-slate-900/30' : 'text-slate-600 bg-slate-50'}`}>
                  <th className="p-4">Assmt ID</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Heart Risk</th>
                  <th className="p-4 text-center">Diabetes Risk</th>
                  <th className="p-4">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit text-xs">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                      No assessments found in database.
                    </td>
                  </tr>
                ) : (
                  assessments.slice(0, 7).map((a) => {
                    const heartLvl = a.categories?.heart?.level || (a.heart?.probability > 0.5 ? 'High' : 'Low') || 'N/A';
                    const diabLvl = a.categories?.diabetes?.level || (a.diabetes?.probability > 0.5 ? 'High' : 'Low') || 'N/A';
                    const overallLvl = a.overall_risk || a.overallLevel || 'Low';

                    return (
                      <tr key={a.assessment_id || a._id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'}`}>
                        <td className={`p-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          #{(a.assessment_id || a._id || '').slice(-6)}
                        </td>
                        <td className={`p-4 font-mono truncate max-w-[120px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {a.user_id}
                        </td>
                        <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              heartLvl === 'High' || heartLvl === 'Elevated'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                : heartLvl === 'Moderate'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {heartLvl}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              diabLvl === 'High' || diabLvl === 'Elevated'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                : diabLvl === 'Moderate'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {diabLvl}
                          </span>
                        </td>
                        <td className={`p-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          <span
                            className={
                              overallLvl === 'High' || overallLvl === 'Elevated'
                                ? (isDark ? 'text-rose-400' : 'text-rose-600')
                                : overallLvl === 'Moderate'
                                ? (isDark ? 'text-amber-400' : 'text-amber-600')
                                : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            }
                          >
                            {overallLvl}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Monitoring Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold flex items-center gap-2 text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <BrainCircuit className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Active ML Pipelines
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTo?.('models', 'model-versions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Models</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {models.length === 0 && (
            <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 text-slate-400 text-center text-sm font-mono">
              No models currently loaded.
            </div>
          )}

          {models.map((model, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
                isDark ? 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/30' : 'bg-white border-slate-200'
              }`}
            >
              {model.is_active && (
                <div className="absolute top-0 right-0">
                  <span className="px-2.5 py-0.5 rounded-bl-xl text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border-b border-l border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">
                    {model.disease_type || model.name || 'ML Model'}
                  </h4>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5 uppercase tracking-wider">
                    {model.algorithm || model.model_type || 'RandomForest'} • {model.version || 'v1.0'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <Server className="w-4 h-4" />
                </div>
              </div>

              <div className={`space-y-2 pt-2 border-t text-xs ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Accuracy</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ROC-AUC</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {model.roc_auc ? model.roc_auc.toFixed(3) : model.metrics?.roc_auc ? model.metrics.roc_auc.toFixed(3) : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>F1 Score</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {model.f1 ? model.f1.toFixed(3) : model.metrics?.f1 ? model.metrics.f1.toFixed(3) : '--'}
                  </span>
                </div>
                <div className={`pt-2 border-t text-[10px] font-mono ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-600'}`}>
                  Trained: {model.training_date ? new Date(model.training_date).toLocaleDateString() : 'Active Baseline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
