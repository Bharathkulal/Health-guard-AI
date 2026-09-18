import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export function RiskBadge({ level = 'Low', size = 'md', className = '' }) {
  const normalized = String(level).toLowerCase();

    const configs = {
      low: {
        label: 'Low Risk',
        icon: ShieldCheck,
        classes: 'bg-[#E8F2ED] text-[#16805F] border-[#16805F]/20',
        dotClass: 'bg-[#16805F]',
      },
      moderate: {
        label: 'Moderate Risk',
        icon: AlertCircle,
        classes: 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/20',
        dotClass: 'bg-[#B7791F]',
      },
      elevated: {
        label: 'Elevated Risk',
        icon: AlertTriangle,
        classes: 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/20',
        dotClass: 'bg-[#B7791F]',
      },
      high: {
        label: 'High Risk',
        icon: ShieldAlert,
        classes: 'bg-[#C24141]/10 text-[#C24141] border-[#C24141]/20',
        dotClass: 'bg-[#C24141]',
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
