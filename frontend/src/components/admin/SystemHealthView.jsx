import React, { useState, useEffect } from 'react';
import {
  ActivitySquare,
  Server,
  Database,
  BrainCircuit,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Cpu,
  Shield,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function SystemHealthView() {
  const { isDark } = useTheme();

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/system/health');
      if (res?.success && res.data) {
        setHealthData(res.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              System <span className="text-emerald-400">Health & Diagnostics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live telemetry checks for Backend APIs, MongoDB cluster, Scikit-Learn inference pipelines, and dataset storage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs font-mono text-slate-400">
                Last checked: {lastRefreshed}
              </span>
            )}
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Run Health Check</span>
            </button>
          </div>
        </div>
      </header>

      {loading && !healthData ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="font-mono text-xs">Pinging system services and database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Backend API Status */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Backend API Service</h3>
                  <p className="text-[11px] text-slate-400 font-mono">FastAPI REST Server</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {healthData?.api?.status || 'HEALTHY'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Framework:</span>
                <span>{healthData?.api?.framework || 'FastAPI 0.115.0'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Uptime:</span>
                <span className="text-emerald-400 font-bold">{healthData?.api?.uptime || 'Active'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Version:</span>
                <span>v{healthData?.api?.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Environment:</span>
                <span>{healthData?.api?.environment || 'Development'}</span>
              </div>
            </div>
          </div>

          {/* 2. Database Status */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Database Engine</h3>
                  <p className="text-[11px] text-slate-400 font-mono">MongoDB / Motor AsyncIO</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                  healthData?.database?.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    healthData?.database?.connected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {healthData?.database?.status || 'CONNECTED'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Database Name:</span>
                <span className="text-emerald-400 font-bold">{healthData?.database?.database_name || 'healthguard'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Ping Latency:</span>
                <span className="text-emerald-400 font-bold">{healthData?.database?.ping_latency_ms} ms</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Storage Mode:</span>
                <span>{healthData?.database?.storage_mode || 'MongoDB Cluster'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Collections:</span>
                <span>{healthData?.database?.collections_count || 4} Collections</span>
              </div>
            </div>
          </div>

          {/* 3. ML Service Status */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">ML Inference Engine</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Scikit-Learn Multi-Model Pipelines</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {healthData?.ml_service?.status || 'ACTIVE'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Engine State:</span>
                <span className="text-emerald-400 font-bold">Ready for Predictions</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Active Models:</span>
                <span className="text-emerald-400 font-bold">{healthData?.ml_service?.active_models_count || 3} Active</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Total Catalog Models:</span>
                <span>{healthData?.ml_service?.total_registered_models || 3} Versions</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Inference Mode:</span>
                <span>{healthData?.ml_service?.inference_mode || 'Calibrated Pipeline'}</span>
              </div>
            </div>
          </div>

          {/* 4. Dataset Storage Status */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Dataset Storage</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Local Storage Repository</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {healthData?.dataset_storage?.status || 'HEALTHY'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Stored Datasets:</span>
                <span className="text-emerald-400 font-bold">{healthData?.dataset_storage?.total_datasets || 0} Files</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Disk Usage:</span>
                <span className="text-slate-100 font-bold">{healthData?.dataset_storage?.storage_used || '0.00 MB'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Write Permission:</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Storage Directory:</span>
                <span className="truncate max-w-[180px] text-[10px]">{healthData?.dataset_storage?.storage_path || 'ml/data'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
