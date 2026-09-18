import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Layers,
  ActivitySquare,
  CheckCircle2,
  XCircle,
  Eye,
  PlaySquare,
  RefreshCw,
  Server,
  Zap,
  Sliders,
  BarChart3,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function ModelManagementView({ viewType = 'versions', onNavigateTo, onSelectForRetrain }) {
  const { isDark } = useTheme();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [selectedModel, setSelectedModel] = useState(null); // Modal details
  const [activatingId, setActivatingId] = useState(null);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/models');
      if (res?.success && Array.isArray(res.data)) {
        setModels(res.data);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleActivate = async (modelId) => {
    setActivatingId(modelId);
    try {
      const res = await adminApi.post(`/admin/models/${modelId}/activate`);
      if (res?.success) {
        await fetchModels();
      }
    } catch (err) {
      alert('Failed to activate model: ' + (err?.data?.detail || err?.message));
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (modelId) => {
    try {
      const res = await adminApi.post(`/admin/models/${modelId}/deactivate`);
      if (res?.success) {
        await fetchModels();
      }
    } catch (err) {
      alert('Failed to deactivate model: ' + (err?.data?.detail || err?.message));
    }
  };

  const handleDelete = async (modelId) => {
    if (!window.confirm('Delete this model version from catalog?')) return;
    try {
      const res = await adminApi.delete(`/admin/models/${modelId}`);
      if (res?.success) {
        await fetchModels();
        if (selectedModel?.model_id === modelId) setSelectedModel(null);
      }
    } catch (err) {
      alert('Failed to delete model: ' + (err?.data?.detail || err?.message));
    }
  };

  const filteredModels = models.filter((m) => {
    if (selectedCondition === 'ALL') return true;
    return (
      m.condition?.toLowerCase() === selectedCondition.toLowerCase() ||
      m.disease_type?.toLowerCase() === selectedCondition.toLowerCase()
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {viewType === 'performance' ? (
                <>Model <span className="text-emerald-400">Performance</span></>
              ) : (
                <>Model <span className="text-emerald-400">Versions</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active inference models route patient health assessments in real time. Compare metrics across versions and algorithms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchModels}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTo?.('models', 'train-model')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-emerald-soft"
            >
              <span>+ Train New Model</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Conditions' },
            { id: 'heart', label: 'Heart Disease' },
            { id: 'diabetes', label: 'Diabetes' },
            { id: 'hypertension', label: 'Hypertension' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCondition(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCondition === tab.id
                  ? 'bg-emerald-500 text-black shadow-emerald-soft'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          {filteredModels.filter((m) => m.is_active).length} Active Pipelines Configured
        </div>
      </div>

      {/* Models Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="font-mono text-xs">Loading registered models...</span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 font-mono">
            No models found for this category.
          </div>
        ) : (
          filteredModels.map((model) => {
            const isActive = model.is_active;

            return (
              <div
                key={model.model_id}
                className={`p-6 rounded-3xl border relative flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-[#0a2016] to-[#040e09] border-emerald-500/50 shadow-emerald-soft shadow-lg'
                    : isDark
                    ? 'bg-[#050f0a] border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Active Indicator Top Badge */}
                {isActive && (
                  <div className="absolute -top-3 right-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-emerald-500 text-black shadow-md uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      ACTIVE INFERENCE MODEL
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">
                        {model.disease_type || model.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                          {model.algorithm || 'RandomForest'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {model.version || 'v1.0'}
                        </span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
                      <span className="text-sm font-bold text-slate-100">
                        {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : '--'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">ROC-AUC</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {model.roc_auc ? model.roc_auc.toFixed(3) : '--'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">F1 Score</span>
                      <span className="text-sm font-bold text-slate-100">
                        {model.f1 ? model.f1.toFixed(3) : '--'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                    <p className="truncate">Dataset: {model.dataset_name || 'Benchmark Dataset'}</p>
                    <p>Trained: {model.training_date ? new Date(model.training_date).toLocaleDateString() : 'Baseline'}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModel(model)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(model.model_id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-colors"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={activatingId === model.model_id}
                        onClick={() => handleActivate(model.model_id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-emerald-soft disabled:opacity-50"
                      >
                        {activatingId === model.model_id ? 'Activating...' : 'Activate'}
                      </button>
                    )}

                    {!isActive && !model.model_id.includes('baseline') && (
                      <button
                        type="button"
                        title="Delete Model"
                        onClick={() => handleDelete(model.model_id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Model Performance Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#050f0a] border-emerald-500/30' : 'bg-white border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{selectedModel.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedModel.algorithm} • Version: {selectedModel.version} • Status: {selectedModel.status}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {selectedModel.accuracy ? `${(selectedModel.accuracy * 100).toFixed(1)}%` : '--'}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ROC-AUC</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {selectedModel.roc_auc ? selectedModel.roc_auc.toFixed(3) : '--'}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">F1 Score</span>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {selectedModel.f1 ? selectedModel.f1.toFixed(3) : '--'}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Precision</span>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {selectedModel.precision ? `${(selectedModel.precision * 100).toFixed(1)}%` : '--'}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recall</span>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {selectedModel.recall ? `${(selectedModel.recall * 100).toFixed(1)}%` : '--'}
                  </div>
                </div>
              </div>

              {/* Confusion Matrix */}
              {selectedModel.confusion_matrix && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Evaluation Confusion Matrix
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-center font-mono">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">True Negative</span>
                      <span className="text-2xl font-black text-slate-100">
                        {selectedModel.confusion_matrix[0]?.[0] ?? 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-[10px] text-rose-400 uppercase font-bold block">False Positive</span>
                      <span className="text-2xl font-black text-slate-100">
                        {selectedModel.confusion_matrix[0]?.[1] ?? 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">False Negative</span>
                      <span className="text-2xl font-black text-slate-100">
                        {selectedModel.confusion_matrix[1]?.[0] ?? 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">True Positive</span>
                      <span className="text-2xl font-black text-slate-100">
                        {selectedModel.confusion_matrix[1]?.[1] ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Importances */}
              {selectedModel.feature_importances && selectedModel.feature_importances.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Top Contributing Feature Weights
                  </h4>
                  <div className="space-y-2">
                    {selectedModel.feature_importances.slice(0, 6).map((imp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300 font-bold">{imp.label || imp.feature}</span>
                          <span className="text-emerald-400">{(imp.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, imp.importance * 100 * 2.5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-inherit flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!selectedModel.is_active && (
                  <button
                    type="button"
                    onClick={() => {
                      handleActivate(selectedModel.model_id);
                      setSelectedModel(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-emerald-soft"
                  >
                    Activate for Live Predictions
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedModel;
                    setSelectedModel(null);
                    onNavigateTo?.('models', 'train-model');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/20"
                >
                  Retrain Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
