import React, { useState, useEffect } from 'react';
import { useAdmin, adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { DashboardOverviewView } from '../../components/admin/DashboardOverviewView';
import { UploadDatasetView } from '../../components/admin/UploadDatasetView';
import { DatasetLibraryView } from '../../components/admin/DatasetLibraryView';
import { DatasetValidationView } from '../../components/admin/DatasetValidationView';
import { TrainModelView } from '../../components/admin/TrainModelView';
import { ModelManagementView } from '../../components/admin/ModelManagementView';
import { AnalyticsView } from '../../components/admin/AnalyticsView';
import { UsersManagementView } from '../../components/admin/UsersManagementView';
import { SystemHealthView } from '../../components/admin/SystemHealthView';
import { AdminSettingsView } from '../../components/admin/AdminSettingsView';

export function AdminDashboard() {
  const { isDark } = useTheme();

  // Navigation State
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [currentSubSection, setCurrentSubSection] = useState('overview');
  const [preselectedDataset, setPreselectedDataset] = useState(null);

  // Global Data
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, assessRes, modelsRes] = await Promise.all([
        adminApi.get('/admin/stats').catch(() => ({ success: false })),
        adminApi.get('/admin/assessments').catch(() => ({ success: false })),
        adminApi.get('/admin/models').catch(() => ({ success: false })),
      ]);

      if (statsRes?.success && statsRes?.data) setStats(statsRes.data);
      if (assessRes?.success && Array.isArray(assessRes?.data)) setAssessments(assessRes.data);
      if (modelsRes?.success && Array.isArray(modelsRes?.data)) setModels(modelsRes.data);
    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectNavigation = (sectionId, subSectionId) => {
    setCurrentSection(sectionId);
    setCurrentSubSection(subSectionId);
  };

  const handleSelectDatasetForTraining = (dataset) => {
    setPreselectedDataset(dataset);
  };

  if (loading && !stats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#020704]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading Admin System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#020704]' : 'bg-slate-50'}`}>
      {/* Expanded Admin Sidebar */}
      <AdminSidebar
        currentSection={currentSection}
        currentSubSection={currentSubSection}
        onSelectNavigation={handleSelectNavigation}
      />

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {/* 1. Dashboard Overview */}
          {currentSubSection === 'overview' && (
            <DashboardOverviewView
              stats={stats}
              assessments={assessments}
              models={models}
              onNavigateTo={handleSelectNavigation}
            />
          )}

          {/* 2. Dataset Management */}
          {currentSubSection === 'upload-dataset' && (
            <UploadDatasetView onNavigateTo={handleSelectNavigation} />
          )}

          {currentSubSection === 'dataset-library' && (
            <DatasetLibraryView
              onNavigateTo={handleSelectNavigation}
              onSelectDatasetForTraining={handleSelectDatasetForTraining}
            />
          )}

          {currentSubSection === 'dataset-validation' && (
            <DatasetValidationView
              onNavigateTo={handleSelectNavigation}
              onSelectDatasetForTraining={handleSelectDatasetForTraining}
            />
          )}

          {/* 3. ML Models */}
          {currentSubSection === 'train-model' && (
            <TrainModelView
              preselectedDataset={preselectedDataset}
              onNavigateTo={handleSelectNavigation}
              onModelTrained={() => fetchDashboardData()}
            />
          )}

          {currentSubSection === 'model-performance' && (
            <ModelManagementView
              viewType="performance"
              onNavigateTo={handleSelectNavigation}
              onSelectForRetrain={handleSelectDatasetForTraining}
            />
          )}

          {currentSubSection === 'model-versions' && (
            <ModelManagementView
              viewType="versions"
              onNavigateTo={handleSelectNavigation}
              onSelectForRetrain={handleSelectDatasetForTraining}
            />
          )}

          {/* 4. Analytics */}
          {['assessment-analytics', 'risk-distribution', 'user-statistics'].includes(currentSubSection) && (
            <AnalyticsView subType={currentSubSection} />
          )}

          {/* 5. Users */}
          {['all-users', 'assessment-history'].includes(currentSubSection) && (
            <UsersManagementView subType={currentSubSection} />
          )}

          {/* 6. System */}
          {currentSubSection === 'system-health' && <SystemHealthView />}

          {currentSubSection === 'settings' && <AdminSettingsView />}
        </div>
      </div>
    </div>
  );
}
