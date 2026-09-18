import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Database,
  BarChart2,
  AlertCircle,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function UploadDatasetView({ onNavigateTo }) {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedResult, setUploadedResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Unsupported file format. Please select a .CSV or .XLSX file.');
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (!datasetName) {
      setDatasetName(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a CSV or XLSX file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (datasetName) formData.append('name', datasetName);
    if (targetColumn) formData.append('target_column', targetColumn);

    try {
      setUploadProgress(60);
      const res = await adminApi.upload('/admin/datasets/upload', formData);
      setUploadProgress(100);
      if (res?.success && res?.data) {
        setUploadedResult(res.data);
      } else {
        setError(res?.detail || res?.message || 'Failed to process dataset.');
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Dataset upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDatasetName('');
    setTargetColumn('');
    setUploadedResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Upload <span className="text-emerald-400">Dataset</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ingest raw clinical datasets (CSV or XLSX). The system will automatically compute real schema statistics, detect missing values, duplicates, and validate structure.
        </p>
      </header>

      {/* Upload Zone & Configuration */}
      {!uploadedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dropzone Container */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px] ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : isDark
                  ? 'border-slate-800 bg-[#050f0a] hover:border-emerald-500/30'
                  : 'border-slate-300 bg-white hover:border-emerald-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-emerald-soft">
                    {selectedFile.name.endsWith('.csv') ? (
                      <FileText className="w-8 h-8" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{selectedFile.name}</h3>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for processing
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetForm();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
                  >
                    Remove and select different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Drag & Drop your clinical dataset here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports <span className="text-emerald-400 font-mono font-semibold">.CSV</span> and{' '}
                      <span className="text-emerald-400 font-mono font-semibold">.XLSX</span> tabular files
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all inline-flex items-center gap-2"
                  >
                    <span>Browse Files</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Configuration Form Card */}
          <div
            className={`p-6 rounded-3xl border flex flex-col justify-between ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Dataset Settings
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dataset Display Name
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. Cleveland Heart Disease Cohort"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Outcome Column (Optional)
                </label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g. target, cardio, diabetes, outcome"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <p className="text-[11px] text-slate-500 font-mono">
                  If omitted, target column will be auto-detected.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real Backend Processing</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  The dataset is parsed using pandas on the server. Statistics are computed on the actual rows and columns.
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-emerald-400">
                    <span>Processing & Analyzing Data...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedFile || uploading}
                onClick={handleUpload}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-emerald-soft"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Dataset...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload and Ingest Dataset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Dataset Summary & Preview */}
      {uploadedResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Success Banner */}
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Dataset Successfully Ingested: {uploadedResult.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {uploadedResult.dataset_id} • Type: {uploadedResult.file_type} • File Size: {uploadedResult.file_size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Upload Another
              </button>
              <button
                type="button"
                onClick={() => onNavigateTo?.('datasets', 'dataset-validation')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <span>Proceed to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dataset Summary KPI Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              Dataset Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Records</span>
                <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {uploadedResult.records_count?.toLocaleString() || 0}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Features</span>
                <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {uploadedResult.features_count || 0}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Missing Values</span>
                <div className={`text-2xl font-black font-mono mt-1 ${uploadedResult.missing_values_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {uploadedResult.missing_values_count || 0}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicates</span>
                <div className={`text-2xl font-black font-mono mt-1 ${uploadedResult.duplicates_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {uploadedResult.duplicates_count || 0}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Column</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-2 truncate">
                  {uploadedResult.target_column || 'None detected'}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Validation Status</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    uploadedResult.validation_status === 'Valid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {uploadedResult.validation_status || 'Valid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column Schema & Inferred Data Types */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Column Schema & Data Types ({uploadedResult.columns?.length || 0} columns)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {uploadedResult.columns?.map((col) => {
                const dtype = uploadedResult.data_types?.[col] || 'Numeric';
                const missing = uploadedResult.missing_per_column?.[col] || 0;
                const isTarget = col === uploadedResult.target_column;

                return (
                  <div
                    key={col}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      isTarget
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : isDark
                        ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-bold truncate">{col}</span>
                      {isTarget && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                          TARGET
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>{dtype}</span>
                      {missing > 0 ? (
                        <span className="text-amber-400">{missing} missing</span>
                      ) : (
                        <span className="text-emerald-500">100% complete</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dataset Preview Table */}
          {uploadedResult.preview && uploadedResult.preview.length > 0 && (
            <div
              className={`rounded-3xl border overflow-hidden flex flex-col ${
                isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-5 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    Dataset Preview (First {uploadedResult.preview.length} Rows)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Live raw records ingested from file
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-inherit text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40 sticky top-0">
                      <th className="p-3 font-mono">#</th>
                      {uploadedResult.columns?.map((col) => (
                        <th key={col} className="p-3 font-mono">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit text-xs font-mono">
                    {uploadedResult.preview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-slate-500">{rIdx + 1}</td>
                        {uploadedResult.columns?.map((col) => (
                          <td key={col} className="p-3 text-slate-300 whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
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

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="text-xs text-slate-400">
              Dataset registered in library. You can now run deep validation or train an ML classification model.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTo?.('datasets', 'dataset-library')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Go to Dataset Library
              </button>
              <button
                type="button"
                onClick={() => onNavigateTo?.('models', 'train-model')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-emerald-soft flex items-center gap-1.5"
              >
                <span>Use for Model Training</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
