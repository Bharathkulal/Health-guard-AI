import React, { useState, useEffect } from 'react';
import {
  LineChart,
  PieChart,
  Users2,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Droplets,
  TrendingUp,
  RefreshCw,
  Layers,
  Database,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function AnalyticsView({ subType = 'assessment-analytics' }) {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState(subType);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(subType);
  }, [subType]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [aRes, rRes, uRes] = await Promise.all([
        adminApi.get('/admin/analytics').catch(() => ({ success: false })),
        adminApi.get('/admin/analytics/risk-distribution').catch(() => ({ success: false })),
        adminApi.get('/admin/analytics/user-statistics').catch(() => ({ success: false })),
      ]);

      if (aRes?.success && aRes.data) setAnalyticsData(aRes.data);
      if (rRes?.success && rRes.data) setRiskData(rRes.data);
      if (uRes?.success && uRes.data) setUserData(uRes.data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Clinical <span className="text-emerald-400">Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real database analytics aggregating assessment volume, epidemiological risk prevalence, and user cohort telemetry.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-fit">
        {[
          { id: 'assessment-analytics', label: 'Assessment Analytics', icon: LineChart },
          { id: 'risk-distribution', label: 'Risk Distribution', icon: PieChart },
          { id: 'user-statistics', label: 'User Statistics', icon: Users2 },
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
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="font-mono text-xs">Computing real database analytics...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: Assessment Analytics */}
          {activeTab === 'assessment-analytics' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assessments</span>
                  <div className="text-3xl font-black text-slate-100 font-mono mt-1">
                    {analyticsData?.total_assessments || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Logged across all time</p>
                </div>

                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Risk Score</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                    {analyticsData?.average_risk_score || '--'} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mean composite clinical score</p>
                </div>

                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Evaluations</span>
                  <div className="text-3xl font-black text-slate-100 font-mono mt-1">
                    {analyticsData?.assessments_evaluated_count || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Processed via ML models</p>
                </div>
              </div>

              {/* Daily Volume Bar Chart */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Daily Assessment Volume (Recent Activity)
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Real Database Records</span>
                </div>

                {analyticsData?.daily_trends && analyticsData.daily_trends.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-2 items-end h-48 pt-6">
                      {analyticsData.daily_trends.map((item, idx) => {
                        const maxCount = Math.max(...analyticsData.daily_trends.map((d) => d.count), 1);
                        const heightPct = Math.max(12, Math.round((item.count / maxCount) * 100));
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-xs font-mono text-emerald-400 font-bold">
                              {item.count}
                            </span>
                            <div
                              className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 hover:opacity-80"
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                              {item.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-mono">No daily trend telemetry available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Risk Distribution */}
          {activeTab === 'risk-distribution' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Overall Risk Distribution Card */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  Overall Composite Risk Category Distribution
                </h3>

                {riskData?.overall && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Low Risk */}
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase">
                        <span>Low Risk Clear</span>
                        <span className="font-mono">{riskData.overall.percentages?.Low || 0}%</span>
                      </div>
                      <div className="text-3xl font-black text-emerald-400 font-mono">
                        {riskData.overall.counts?.Low || 0}
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${riskData.overall.percentages?.Low || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Moderate Risk */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-amber-400 uppercase">
                        <span>Moderate Risk</span>
                        <span className="font-mono">{riskData.overall.percentages?.Moderate || 0}%</span>
                      </div>
                      <div className="text-3xl font-black text-amber-400 font-mono">
                        {riskData.overall.counts?.Moderate || 0}
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${riskData.overall.percentages?.Moderate || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* High Risk */}
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-rose-400 uppercase">
                        <span>High Risk Detected</span>
                        <span className="font-mono">{riskData.overall.percentages?.High || 0}%</span>
                      </div>
                      <div className="text-3xl font-black text-rose-400 font-mono">
                        {riskData.overall.counts?.High || 0}
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-rose-400"
                          style={{ width: `${riskData.overall.percentages?.High || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* By Condition Breakdown */}
              {riskData?.by_condition && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Heart Disease */}
                  <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Cardiovascular Prevalence</span>
                    </div>
                    <div className="space-y-2 pt-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Low:</span>
                        <span className="text-emerald-400">{riskData.by_condition.heart?.counts?.Low || 0} ({riskData.by_condition.heart?.percentages?.Low || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Moderate:</span>
                        <span className="text-amber-400">{riskData.by_condition.heart?.counts?.Moderate || 0} ({riskData.by_condition.heart?.percentages?.Moderate || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>High:</span>
                        <span className="text-rose-400">{riskData.by_condition.heart?.counts?.High || 0} ({riskData.by_condition.heart?.percentages?.High || 0}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Diabetes */}
                  <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                      <Droplets className="w-4 h-4 text-amber-400" />
                      <span>Diabetes Prevalence</span>
                    </div>
                    <div className="space-y-2 pt-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Low:</span>
                        <span className="text-emerald-400">{riskData.by_condition.diabetes?.counts?.Low || 0} ({riskData.by_condition.diabetes?.percentages?.Low || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Moderate:</span>
                        <span className="text-amber-400">{riskData.by_condition.diabetes?.counts?.Moderate || 0} ({riskData.by_condition.diabetes?.percentages?.Moderate || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>High:</span>
                        <span className="text-rose-400">{riskData.by_condition.diabetes?.counts?.High || 0} ({riskData.by_condition.diabetes?.percentages?.High || 0}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Hypertension */}
                  <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Hypertension Prevalence</span>
                    </div>
                    <div className="space-y-2 pt-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Low:</span>
                        <span className="text-emerald-400">{riskData.by_condition.hypertension?.counts?.Low || 0} ({riskData.by_condition.hypertension?.percentages?.Low || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Moderate:</span>
                        <span className="text-amber-400">{riskData.by_condition.hypertension?.counts?.Moderate || 0} ({riskData.by_condition.hypertension?.percentages?.Moderate || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>High:</span>
                        <span className="text-rose-400">{riskData.by_condition.hypertension?.counts?.High || 0} ({riskData.by_condition.hypertension?.percentages?.High || 0}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: User Statistics */}
          {activeTab === 'user-statistics' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</span>
                  <div className="text-3xl font-black text-slate-100 font-mono mt-1">
                    {userData?.total_users || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Database user accounts</p>
                </div>

                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                    {userData?.active_users || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Completed ≥ 1 assessment</p>
                </div>

                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive Users</span>
                  <div className="text-3xl font-black text-slate-400 font-mono mt-1">
                    {userData?.inactive_users || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">0 assessments taken</p>
                </div>

                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Assessments / User</span>
                  <div className="text-3xl font-black text-slate-100 font-mono mt-1">
                    {userData?.average_assessments_per_user || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Engagement intensity</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
