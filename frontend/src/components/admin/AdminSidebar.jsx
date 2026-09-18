import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Upload,
  FolderOpen,
  CheckCircle2,
  BrainCircuit,
  PlaySquare,
  BarChart3,
  Layers,
  LineChart,
  PieChart,
  Users2,
  UserCheck,
  History,
  ActivitySquare,
  Sliders,
  Shield,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function AdminSidebar({ currentSection, currentSubSection, onSelectNavigation }) {
  const { adminUser, logout } = useAdmin();
  const { isDark } = useTheme();

  // Collapsible state for sidebar groups
  const [openGroups, setOpenGroups] = useState({
    dashboard: true,
    datasets: true,
    models: true,
    analytics: true,
    users: true,
    system: true,
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const navGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
      ],
    },
    {
      id: 'datasets',
      label: 'Dataset Management',
      icon: Database,
      items: [
        { id: 'upload-dataset', label: 'Upload Dataset', icon: Upload },
        { id: 'dataset-library', label: 'Dataset Library', icon: FolderOpen },
        { id: 'dataset-validation', label: 'Dataset Validation', icon: CheckCircle2 },
      ],
    },
    {
      id: 'models',
      label: 'ML Models',
      icon: BrainCircuit,
      items: [
        { id: 'train-model', label: 'Train Model', icon: PlaySquare },
        { id: 'model-performance', label: 'Model Performance', icon: ActivitySquare },
        { id: 'model-versions', label: 'Model Versions', icon: Layers },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: LineChart,
      items: [
        { id: 'assessment-analytics', label: 'Assessment Analytics', icon: LineChart },
        { id: 'risk-distribution', label: 'Risk Distribution', icon: PieChart },
        { id: 'user-statistics', label: 'User Statistics', icon: Users2 },
      ],
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users2,
      items: [
        { id: 'all-users', label: 'All Users', icon: UserCheck },
        { id: 'assessment-history', label: 'Assessment History', icon: History },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: ActivitySquare,
      items: [
        { id: 'system-health', label: 'System Health', icon: ActivitySquare },
        { id: 'settings', label: 'Settings', icon: Sliders },
      ],
    },
  ];

  return (
    <div
      className={`w-72 border-r flex flex-col flex-shrink-0 select-none transition-colors duration-200 ${
        isDark ? 'bg-[#050f0a] border-emerald-950/40' : 'bg-white border-slate-200'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-emerald-soft">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-slate-100 tracking-tight">HealthGuard AI</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-mono text-emerald-500/70 mt-0.5">
              ML & Data Control Plane
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroups[group.id] !== false;
          const isCurrentGroup = group.items.some((item) => item.id === currentSubSection);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isCurrentGroup
                    ? 'text-emerald-400 bg-emerald-500/5'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-4 h-4 text-emerald-500/80" />
                  <span>{group.label}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>

              {/* Sub-Items */}
              {isOpen && (
                <div className="pl-2 space-y-0.5">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = currentSubSection === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectNavigation(group.id, item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-emerald-soft'
                            : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <ItemIcon
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-emerald-400' : 'opacity-60'
                          }`}
                        />
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Section & Terminate Session */}
      <div className="p-3.5 border-t border-inherit space-y-2">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-200">
              {adminUser?.name || 'System Administrator'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {adminUser?.email || 'admin@healthguard.ai'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
}
