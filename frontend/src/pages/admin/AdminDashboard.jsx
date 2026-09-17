import React, { useState, useEffect } from 'react';
import { useAdmin, adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, Activity, BrainCircuit, Shield, AlertTriangle, 
  CheckCircle, Database, Server, LogOut, ArrowRight, Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { adminUser, logout } = useAdmin();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, assessRes, modelsRes] = await Promise.all([
          adminApi.get('/admin/stats'),
          adminApi.get('/admin/assessments'),
          adminApi.get('/admin/model-info')
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (assessRes.success) setAssessments(assessRes.data);
        if (modelsRes.success) setModels(modelsRes.data || []);
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#020704]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading Admin Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#020704]' : 'bg-slate-50'}`}>
      
      {/* Sidebar Navigation */}
      <div className={`w-64 border-r flex flex-col ${isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-6 border-b border-inherit">
          <div className="flex items-center gap-3 text-emerald-400">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-slate-100">HealthGuard Admin</h1>
              <p className="text-[10px] uppercase tracking-wider font-mono opacity-60">System Control</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20`}>
            <Activity className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </div>
          {/* Future links: Users, Models, Settings */}
        </div>
        
        <div className="p-4 border-t border-inherit">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/50 text-slate-300">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold truncate">{adminUser?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          <header className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-100">System Dashboard</h1>
            <p className="text-slate-400">Live monitoring of user volume, ML risk evaluations, and active models.</p>
          </header>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-slate-100">{stats?.total_users || 0}</div>
            </div>
            
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Assessments</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-slate-100">{stats?.total_assessments || 0}</div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-rose-900/30' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">High Risk Detected</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-black text-slate-100">{stats?.risk_distribution?.High || 0}</div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-emerald-900/30' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Low Risk Clear</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-slate-100">{stats?.risk_distribution?.Low || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Table: Recent Assessments */}
            <div className={`lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-5 border-b border-inherit flex items-center justify-between">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Recent Assessments Log
                </h3>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-inherit text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/20">
                      <th className="p-4">Assmt ID</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-center">Heart Risk</th>
                      <th className="p-4 text-center">Diabetes Risk</th>
                      <th className="p-4">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit text-sm">
                    {assessments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">No assessments found in database.</td>
                      </tr>
                    ) : (
                      assessments.map((a) => (
                        <tr key={a.assessment_id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-400">#{a.assessment_id.slice(-6)}</td>
                          <td className="p-4 font-mono text-xs text-emerald-400">{a.user_id}</td>
                          <td className="p-4 text-slate-300">{new Date(a.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                              a.categories?.heart?.level === 'High' ? 'bg-rose-500/10 text-rose-400' :
                              a.categories?.heart?.level === 'Moderate' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {a.categories?.heart?.level || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                              a.categories?.diabetes?.level === 'High' ? 'bg-rose-500/10 text-rose-400' :
                              a.categories?.diabetes?.level === 'Moderate' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {a.categories?.diabetes?.level || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-200">
                            {a.overall_risk}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Monitoring */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-2">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                Active ML Pipelines
              </h3>
              
              {models.length === 0 && (
                 <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 text-slate-400 text-center text-sm">
                   No models currently loaded.
                 </div>
              )}

              {models.map((model, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-200">{model.disease_type} Prediction</h4>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1 uppercase">
                        {model.model_type} • v{model.version || '1.0'}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Server className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="font-mono text-slate-200">
                        {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">ROC-AUC</span>
                      <span className="font-mono text-slate-200">
                        {model.metrics?.roc_auc ? model.metrics.roc_auc.toFixed(3) : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">F1 Score</span>
                      <span className="font-mono text-slate-200">
                        {model.metrics?.f1 ? model.metrics.f1.toFixed(3) : '--'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono">
                      Training Date: {model.training_date ? new Date(model.training_date).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
