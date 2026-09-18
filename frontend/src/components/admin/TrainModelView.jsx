import React, { useState, useEffect } from 'react';
import {
  PlaySquare,
  BrainCircuit,
  Layers,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sliders,
  BarChart3,
  Server,
  Activity,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function TrainModelView({ preselectedDataset, onNavigateTo, onModelTrained }) {
  const { isDark } = useTheme();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [predictionType, setPredictionType] = useState('heart');
  const [algorithm, setAlgorithm] = useState('RandomForest');
  const [testSplit, setTestSplit] = useState(0.2);
  const [modelName, setModelName] = useState('');
  const [autoActivate, setAutoActivate] = useState(true);

  const [training, setTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch available datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await adminApi.get('/admin/datasets');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setDatasets(res.data);
          
          if (preselectedDataset) {
            setSelectedDatasetId(preselectedDataset.dataset_id);
            setTargetColumn(preselectedDataset.target_column || '');
          } else {
            setSelectedDatasetId(res.data[0].dataset_id);
            setTargetColumn(res.data[0].target_column || '');
          }
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      }
    };
    fetchDatasets();
  }, [preselectedDataset]);

  const handleDatasetChange = (e) => {
    const id = e.target.value;
    setSelectedDatasetId(id);
    const found = datasets.find((d) => d.dataset_id === id);
    if (found) {
      setTargetColumn(found.target_column || '');
    }
  };

  const handleStartTraining = async (e) => {
    e.preventDefault();
    if (!selectedDatasetId) {
      setError('Please select a training dataset.');
      return;
    }
    if (!targetColumn) {
      setError('Please specify a target outcome column.');
      return;
    }

    setTraining(true);
    setError(null);
    setTrainingResult(null);

    try {
      const res = await adminApi.post('/admin/models/train', {
        dataset_id: selectedDatasetId,
        target_column: targetColumn,
        prediction_type: predictionType,
        algorithm: algorithm,
        test_size: parseFloat(testSplit),
        model_name: modelName || undefined,
        auto_activate: autoActivate,
      });

      if (res?.success && res.data) {
        setTrainingResult(res.data);
        if (onModelTrained) onModelTrained(res.data);
      } else {
        setError(res?.detail || 'Training failed.');
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Model training execution failed.');
    } finally {
      setTraining(false);
    }
  };

  const handleActivate = async (modelId) => {
    try {
      const res = await adminApi.post(`/admin/models/${modelId}/activate`);
      if (res?.success) {
        setTrainingResult((prev) => ({ ...prev, is_active: true, status: 'Active' }));
        alert('Model version activated successfully! Live user predictions will now use this model.');
      }
    } catch (err) {
      alert('Activation error: ' + (err?.data?.detail || err?.message));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Train <span className="text-emerald-400">ML Model</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Train real Scikit-Learn classification pipelines on uploaded clinical cohorts. Evaluates 5-fold cross-validation, confusion matrices, and feature importances.
        </p>
      </header>

      {/* Training Configuration Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Controls Form */}
        <div
          className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Training Pipeline Configuration
            </h2>
          </div>

          <form onSubmit={handleStartTraining} className="space-y-5">
            {/* Step 1: Dataset Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Training Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={handleDatasetChange}
                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {datasets.map((ds) => (
                  <option key={ds.dataset_id} value={ds.dataset_id}>
                    {ds.name} ({ds.records_count?.toLocaleString()} records, {ds.features_count} features)
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Target Column */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Target Outcome Column
              </label>
              <input
                type="text"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                placeholder="e.g. cardio, diabetes, target, outcome"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Step 3: Prediction Type & Algorithm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  3. Prediction Condition
                </label>
                <select
                  value={predictionType}
                  onChange={(e) => setPredictionType(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="heart">Heart Disease / CVD Risk</option>
                  <option value="diabetes">Diabetes Mellitus Risk</option>
                  <option value="hypertension">Hypertension Risk</option>
                  <option value="general">General Clinical Binary Risk</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4. Machine Learning Algorithm
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="RandomForest">Random Forest Classifier (Ensemble)</option>
                  <option value="LogisticRegression">Logistic Regression (Calibrated)</option>
                  <option value="GradientBoosting">Gradient Boosting Classifier</option>
                  <option value="DecisionTree">Decision Tree Classifier</option>
                </select>
              </div>
            </div>

            {/* Step 4: Split & Auto-Activate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>Train/Test Split</span>
                  <span className="text-emerald-400 font-mono">
                    {Math.round((1 - testSplit) * 100)}% Train / {Math.round(testSplit * 100)}% Test
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={testSplit}
                  onChange={(e) => setTestSplit(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="autoActivate"
                  checked={autoActivate}
                  onChange={(e) => setAutoActivate(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="autoActivate" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Auto-activate as live inference model upon successful training
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={training || !selectedDatasetId}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-emerald-soft"
            >
              {training ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fitting Scikit-Learn Pipeline & Evaluating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Start Model Training</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Algorithm Info Card */}
        <div className="space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              Pipeline Architecture
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every training run builds a self-contained Scikit-Learn pipeline consisting of:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>Median/Mode Missing Imputer</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>StandardScaler & OneHotEncoder</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span>{algorithm} Estimator</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="font-bold text-emerald-400">Live Active Model:</span> Activating this model replaces the pipeline in <code className="text-slate-300">predictor.py</code> so live users receive evaluations from this model.
            </div>
          </div>
        </div>
      </div>

      {/* Real Training Output Result Card */}
      {trainingResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">
                    Training Complete: {trainingResult.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Version: {trainingResult.version}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Algorithm: {trainingResult.algorithm} • Train Samples: {trainingResult.training_samples?.toLocaleString()} • Test Samples: {trainingResult.testing_samples?.toLocaleString()} • Time: {trainingResult.training_time_seconds}s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!trainingResult.is_active && (
                <button
                  type="button"
                  onClick={() => handleActivate(trainingResult.model_id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-emerald-soft"
                >
                  Activate for Live Inference
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateTo?.('models', 'model-versions')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>View All Model Versions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Genuine Performance Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {(trainingResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">ROC-AUC</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {trainingResult.roc_auc ? trainingResult.roc_auc.toFixed(3) : '--'}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">F1 Score</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {trainingResult.f1 ? trainingResult.f1.toFixed(3) : '--'}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Precision</span>
              <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                {(trainingResult.precision * 100).toFixed(1)}%
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Recall</span>
              <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                {(trainingResult.recall * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confusion Matrix & Feature Importances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual 2x2 Confusion Matrix */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Holdout Confusion Matrix (2x2)
              </h3>

              {trainingResult.confusion_matrix && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 font-mono text-center">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                        True Negatives (TN)
                      </span>
                      <span className="text-2xl font-black text-slate-100">
                        {trainingResult.confusion_matrix[0]?.[0] ?? 0}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-[10px] text-rose-400 uppercase font-bold block">
                        False Positives (FP)
                      </span>
                      <span className="text-2xl font-black text-slate-100">
                        {trainingResult.confusion_matrix[0]?.[1] ?? 0}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">
                        False Negatives (FN)
                      </span>
                      <span className="text-2xl font-black text-slate-100">
                        {trainingResult.confusion_matrix[1]?.[0] ?? 0}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                        True Positives (TP)
                      </span>
                      <span className="text-2xl font-black text-slate-100">
                        {trainingResult.confusion_matrix[1]?.[1] ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Feature Importances */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Top Contributing Feature Coefficients
              </h3>

              {trainingResult.feature_importances && trainingResult.feature_importances.length > 0 ? (
                <div className="space-y-2.5">
                  {trainingResult.feature_importances.slice(0, 6).map((imp, idx) => (
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
              ) : (
                <p className="text-xs text-slate-400 font-mono">Feature weights calculated across all inputs.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
