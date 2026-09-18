import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderOpen,
  PlaySquare,
  RefreshCw,
  Layers,
  ArrowRight,
  Database,
  PieChart,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function DatasetValidationView({ onNavigateTo, onSelectDatasetForTraining }) {
  const { isDark } = useTheme();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [validating, setValidating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await adminApi.get('/admin/datasets');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setDatasets(res.data);
          setSelectedDatasetId(res.data[0].dataset_id);
          setCustomTarget(res.data[0].target_column || '');
        }
      } catch (err) {
        console.error('Failed to load datasets for validation:', err);
      }
    };
    fetchDatasets();
  }, []);

  const handleDatasetChange = (e) => {
    const id = e.target.value;
    setSelectedDatasetId(id);
    const found = datasets.find((d) => d.dataset_id === id);
    if (found) {
      setCustomTarget(found.target_column || '');
    }
    setReport(null);
  };

  const handleRunValidation = async () => {
    if (!selectedDatasetId) {
      setError('Please select a dataset to validate.');
      return;
    }

    setValidating(true);
    setError(null);
    try {
      const res = await adminApi.post(`/admin/datasets/${selectedDatasetId}/validate`, {
        target_column: customTarget || undefined,
      });
      if (res?.success && res.data) {
        setReport(res.data);
      } else {
        setError(res?.detail || 'Validation failed.');
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Failed to execute validation checks.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Dataset <span className="text-emerald-400">Validation</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Execute automated clinical data quality checks. Verifies missing values, duplicate observations, invalid distributions, target balance, and type compatibility.
        </p>
      </header>

      {/* Dataset Selection & Action Bar */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Dataset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Dataset to Validate
            </label>
            <select
              value={selectedDatasetId}
              onChange={handleDatasetChange}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {datasets.map((ds) => (
                <option key={ds.dataset_id} value={ds.dataset_id}>
                  {ds.name} ({ds.records_count?.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Target Column Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target Outcome Column
            </label>
            <input
              type="text"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="e.g. cardio, diabetes, target"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Run Validation Button */}
          <div>
            <button
              type="button"
              disabled={validating || !selectedDatasetId}
              onClick={handleRunValidation}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-emerald-soft"
            >
              {validating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Deep Validation...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Validation Suite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Validation Results Report */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Status Card */}
          <div
            className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
              report.status === 'Valid'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : report.status === 'Warning'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                  report.status === 'Valid'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : report.status === 'Warning'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {report.status === 'Valid' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">
                    Validation Status: {report.status}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900/60 text-slate-300">
                    Readiness Score: {report.overall_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Dataset: {report.dataset_name} • Target Column: {report.target_column || 'None'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const ds = datasets.find((d) => d.dataset_id === selectedDatasetId);
                if (onSelectDatasetForTraining && ds) onSelectDatasetForTraining(ds);
                onNavigateTo?.('models', 'train-model');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-emerald-soft flex items-center gap-1.5"
            >
              <span>Use for Model Training</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Checklist */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Clinical Validation Checks ({report.checks?.length || 0})
            </h3>

            <div className="space-y-2.5">
              {report.checks?.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                    chk.status === 'passed'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : chk.status === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {chk.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : chk.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-100">{chk.name}</h4>
                      <p className="text-xs text-slate-300">{chk.message}</p>
                      {chk.detail && (
                        <p className="text-[11px] text-slate-500 font-mono">{chk.detail}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      chk.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : chk.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Distribution Breakdown */}
          {report.class_distribution && Object.keys(report.class_distribution).length > 0 && (
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Target Outcome Class Balance
              </h3>

              <div className="space-y-3">
                {Object.entries(report.class_distribution).map(([cls, pct]) => (
                  <div key={cls} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Class {cls}</span>
                      <span className="text-emerald-400">{pct}% of records</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
