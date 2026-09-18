import React from 'react';

export function MetricCard({
  label,
  value,
  unit = '',
  status = '',
  statusType = 'normal', // 'normal' | 'warning' | 'alert' | 'neutral'
  icon: Icon,
  targetRange = '',
  className = '',
}) {
  const statusStyles = {
    normal: 'text-[#16805F] bg-[#16805F]/10 border-[#16805F]/20',
    warning: 'text-[#B7791F] bg-[#B7791F]/10 border-[#B7791F]/20',
    alert: 'text-[#C24141] bg-[#C24141]/10 border-[#C24141]/20',
    neutral: 'text-[#66706A] bg-[#F7F4EE] border-[#E5E0D7]',
  }[statusType] || '';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#16805F]/30 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#66706A] truncate">
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8F2ED] text-[#16805F]">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-[#18201C]">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-bold text-[#66706A] uppercase tracking-wider">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5E0D7] flex items-center justify-between gap-2 text-xs">
        {status && (
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusStyles}`}>
            {status}
          </span>
        )}
        {targetRange && (
          <span className="text-[10px] text-[#66706A] font-bold uppercase tracking-widest ml-auto truncate">
            Target: {targetRange}
          </span>
        )}
      </div>
    </div>
  );
}
