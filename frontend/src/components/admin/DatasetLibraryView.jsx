import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Trash2,
  PlaySquare,
  RefreshCw,
  Sparkles,
  X,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function DatasetLibraryView({ onNavigateTo, onSelectDatasetForTraining }) {
  const { isDark } = useTheme();

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDataset, setSelectedDataset] = useState(null); // For preview modal
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/datasets');
      if (res?.success && Array.isArray(res.data)) {
        setDatasets(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDelete = async (datasetId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;

    setDeletingId(datasetId);
    try {
      const res = await adminApi.delete(`/admin/datasets/${datasetId}`);
      if (res?.success) {
        setDatasets((prev) => prev.filter((d) => d.dataset_id !== datasetId));
      }
    } catch (err) {
      alert('Failed to delete dataset: ' + (err?.data?.detail || err?.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleUseForTraining = (dataset, e) => {
    e.stopPropagation();
    if (onSelectDatasetForTraining) {
      onSelectDatasetForTraining(dataset);
    }
    onNavigateTo?.('models', 'train-model');
  };

  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch =
      ds.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.target_column?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.file_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'ALL' ||
      ds.file_type?.toUpperCase() === selectedType ||
      ds.status?.toUpperCase() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Dataset <span className="text-emerald-400">Library</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Centralized repository of clinical training datasets and benchmark cohorts available for validation and ML model training.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDatasets}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTo?.('datasets', 'upload-dataset')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-emerald-soft"
            >
              <span>+ Upload New Dataset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets by name or target column..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'CSV', 'XLSX', 'BUILT-IN'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === type
                  ? 'bg-emerald-500 text-black shadow-emerald-soft'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Table View */}
      <div
        className={`rounded-3xl border overflow-hidden flex flex-col ${
          isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span>Available Datasets ({filteredDatasets.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-inherit text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/30">
                <th className="p-4">Dataset Name</th>
                <th className="p-4">Format</th>
                <th className="p-4 text-center">Records</th>
                <th className="p-4 text-center">Features</th>
                <th className="p-4">Target Column</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-xs">Loading dataset catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500 font-mono">
                    No matching datasets found.
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((ds) => (
                  <tr
                    key={ds.dataset_id}
                    onClick={() => setSelectedDataset(ds)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          {ds.file_type === 'CSV' ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="group-hover:text-emerald-400 transition-colors">{ds.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{ds.file_size}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {ds.file_type || 'CSV'}
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono text-slate-200 font-bold">
                      {ds.records_count?.toLocaleString() || '--'}
                    </td>

                    <td className="p-4 text-center font-mono text-slate-200 font-bold">
                      {ds.features_count || '--'}
                    </td>

                    <td className="p-4 font-mono text-emerald-400 font-semibold">
                      {ds.target_column || <span className="text-slate-500 italic">None</span>}
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {ds.uploaded_at ? new Date(ds.uploaded_at).toLocaleDateString() : 'Baseline'}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ds.validation_status === 'Valid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        }`}
                      >
                        {ds.validation_status || ds.status || 'Ready'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* View Preview Action */}
                        <button
                          type="button"
                          title="View Dataset Schema & Preview"
                          onClick={() => setSelectedDataset(ds)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Validate Action */}
                        <button
                          type="button"
                          title="Validate Dataset"
                          onClick={() => onNavigateTo?.('datasets', 'dataset-validation')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Use for Training Action */}
                        <button
                          type="button"
                          title="Use for ML Training"
                          onClick={(e) => handleUseForTraining(ds, e)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] transition-all flex items-center gap-1 shadow-emerald-soft"
                        >
                          <PlaySquare className="w-3 h-3" />
                          <span>Train</span>
                        </button>

                        {/* Delete Action (only if custom uploaded) */}
                        {ds.status !== 'Built-in' && ds.status !== 'Benchmark' && (
                          <button
                            type="button"
                            title="Delete Dataset"
                            disabled={deletingId === ds.dataset_id}
                            onClick={(e) => handleDelete(ds.dataset_id, e)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Details & Preview Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#050f0a] border-emerald-500/30' : 'bg-white border-slate-200'
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{selectedDataset.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedDataset.records_count?.toLocaleString()} rows • {selectedDataset.features_count} columns • Target: {selectedDataset.target_column || 'N/A'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDataset(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Records</span>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                    {selectedDataset.records_count?.toLocaleString()}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Features</span>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                    {selectedDataset.features_count}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Missing Values</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${selectedDataset.missing_values_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedDataset.missing_values_count || 0}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicates</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${selectedDataset.duplicates_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedDataset.duplicates_count || 0}
                  </div>
                </div>
              </div>

              {/* Columns & Data Types */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Feature Schema & Inferred Data Types
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedDataset.columns?.map((col) => {
                    const dtype = selectedDataset.data_types?.[col] || 'Numeric';
                    const isTarget = col === selectedDataset.target_column;
                    return (
                      <div
                        key={col}
                        className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                          isTarget
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-slate-900/30 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{col}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{dtype}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview Table */}
              {selectedDataset.preview && selectedDataset.preview.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Raw Data Preview (First {selectedDataset.preview.length} Rows)
                  </h4>
                  <div className="border border-slate-800 rounded-2xl overflow-x-auto max-h-64">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                          <th className="p-2.5">#</th>
                          {selectedDataset.columns?.map((c) => (
                            <th key={c} className="p-2.5 whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedDataset.preview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2.5 text-slate-500">{idx + 1}</td>
                            {selectedDataset.columns?.map((c) => (
                              <td key={c} className="p-2.5 whitespace-nowrap text-slate-300">
                                {row[c] !== null && row[c] !== undefined ? String(row[c]) : (
                                  <span className="text-slate-600 italic">null</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-inherit flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDataset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDataset(null);
                    onNavigateTo?.('datasets', 'dataset-validation');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/20"
                >
                  Validate Dataset
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const ds = selectedDataset;
                    setSelectedDataset(null);
                    handleUseForTraining(ds, e);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-emerald-soft flex items-center gap-1.5"
                >
                  <span>Train Model with this Dataset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
