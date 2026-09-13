import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export function RiskBadge({ level = 'Low', size = 'md', className = '' }) {
  const normalized = String(level).toLowerCase();

  const configs = {
    low: {
      label: 'Low Risk',
      icon: ShieldCheck,
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
    },
    moderate: {
      label: 'Moderate Risk',
      icon: AlertCircle,
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400',
    },
    elevated: {
      label: 'Elevated Risk',
      icon: AlertTriangle,
      classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      dotClass: 'bg-orange-400',
    },
    high: {
      label: 'High Risk',
      icon: ShieldAlert,
      classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-400',
    },
  };

  const config = configs[normalized] || configs.low;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size] || 'text-xs px-3 py-1 gap-2';

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size] || 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.classes} ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} animate-pulse`} />
      <Icon className={iconSizes} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
