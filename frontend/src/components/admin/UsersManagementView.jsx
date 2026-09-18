import React, { useState, useEffect } from 'react';
import {
  Users2,
  History,
  Search,
  RefreshCw,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Calendar,
  X,
  Database,
  FileText,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function UsersManagementView({ subType = 'all-users' }) {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState(subType);
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null); // modal

  useEffect(() => {
    setActiveTab(subType);
  }, [subType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        adminApi.get('/admin/users').catch(() => ({ success: false })),
        adminApi.get('/admin/assessments').catch(() => ({ success: false })),
      ]);
      if (uRes?.success && Array.isArray(uRes.data)) setUsers(uRes.data);
      if (aRes?.success && Array.isArray(aRes.data)) setAssessments(aRes.data);
    } catch (err) {
      console.error('Failed to load users data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.user_id?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const filteredAssessments = assessments.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.assessment_id?.toLowerCase().includes(q) ||
      a.user_id?.toLowerCase().includes(q) ||
      a.overall_risk?.toLowerCase().includes(q) ||
      a.overallLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              User <span className="text-emerald-400">Administration</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct access to registered user accounts and clinical risk assessment records stored in the database.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-2">
          {[
            { id: 'all-users', label: 'All Users', icon: Users2, count: users.length },
            { id: 'assessment-history', label: 'Assessment History', icon: History, count: assessments.length },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-emerald-soft'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'all-users' ? 'Search users by name, email, ID...' : 'Search assessments by ID, user...'}
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* VIEW 1: All Users */}
      {activeTab === 'all-users' && (
        <div
          className={`rounded-3xl border overflow-hidden flex flex-col animate-in fade-in duration-300 ${
            isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-inherit text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/30">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name / Identifier</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4 text-center">Assessments</th>
                  <th className="p-4">Last Assessment</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.user_id || u._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-emerald-400 font-bold">{u.user_id}</td>
                      <td className="p-4 font-sans font-bold text-slate-200">{u.name || 'Anonymous User'}</td>
                      <td className="p-4 text-slate-300 font-sans">{u.email}</td>
                      <td className="p-4 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : u.member_since || 'Recent'}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-200">{u.assessment_count || 0}</td>
                      <td className="p-4 text-slate-400">
                        {u.last_assessment ? new Date(u.last_assessment).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.status || 'Registered'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Assessment History */}
      {activeTab === 'assessment-history' && (
        <div
          className={`rounded-3xl border overflow-hidden flex flex-col animate-in fade-in duration-300 ${
            isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-inherit text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/30">
                  <th className="p-4">Assessment ID</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Evaluation Date</th>
                  <th className="p-4 text-center">Heart Risk</th>
                  <th className="p-4 text-center">Diabetes Risk</th>
                  <th className="p-4">Overall Score / Level</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 font-mono">
                      Loading assessment logs...
                    </td>
                  </tr>
                ) : filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500 font-mono">
                      No assessment records found.
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((a) => {
                    const heartLvl = a.categories?.heart?.level || (a.heart?.probability > 0.5 ? 'High' : 'Low') || 'N/A';
                    const diabLvl = a.categories?.diabetes?.level || (a.diabetes?.probability > 0.5 ? 'High' : 'Low') || 'N/A';
                    const overallLvl = a.overall_risk || a.overallLevel || 'Low';
                    const overallScore = a.overallScore ?? (a.overall_score ?? 40);

                    return (
                      <tr
                        key={a.assessment_id || a._id}
                        onClick={() => setSelectedAssessment(a)}
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 font-mono text-emerald-400 font-bold">
                          #{(a.assessment_id || a._id || '').slice(-8)}
                        </td>
                        <td className="p-4 font-mono text-slate-300">{a.user_id}</td>
                        <td className="p-4 text-slate-400 font-mono">
                          {a.created_at ? new Date(a.created_at).toLocaleString() : 'Recent'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              heartLvl === 'High' || heartLvl === 'Elevated'
                                ? 'bg-rose-500/15 text-rose-400'
                                : heartLvl === 'Moderate'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}
                          >
                            {heartLvl}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              diabLvl === 'High' || diabLvl === 'Elevated'
                                ? 'bg-rose-500/15 text-rose-400'
                                : diabLvl === 'Moderate'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}
                          >
                            {diabLvl}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          <span>{overallScore} pts • {overallLvl}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssessment(a);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#050f0a] border-emerald-500/30' : 'bg-white border-slate-200'
            }`}
          >
            <div className="p-5 border-b border-inherit flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base">
                  Assessment Details: #{selectedAssessment.assessment_id || selectedAssessment._id}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  User ID: {selectedAssessment.user_id} • Date: {selectedAssessment.created_at ? new Date(selectedAssessment.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Vitals Snapshot */}
              {selectedAssessment.vitalsSnapshot && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Vitals at Assessment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                      <span className="font-bold text-slate-100">
                        {selectedAssessment.vitalsSnapshot.systolicBP || '--'} / {selectedAssessment.vitalsSnapshot.diastolicBP || '--'} mmHg
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Fasting Glucose</span>
                      <span className="font-bold text-slate-100">
                        {selectedAssessment.vitalsSnapshot.fastingBloodSugar || '--'} mg/dL
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                      <span className="font-bold text-slate-100">
                        {selectedAssessment.vitalsSnapshot.heartRate || '--'} BPM
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">BMI</span>
                      <span className="font-bold text-slate-100">
                        {selectedAssessment.vitalsSnapshot.bmi || '--'} kg/m²
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions Evaluated */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Model Outputs by Condition
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedAssessment.categories || {}).map(([key, cat]) => (
                    <div key={key} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-200 capitalize">{cat.name || key}</span>
                        <span className="text-emerald-400 font-mono">{cat.score || Math.round((cat.probability || 0) * 100)} pts</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{cat.summary || 'Model evaluation computed.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-inherit flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
