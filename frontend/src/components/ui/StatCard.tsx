import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  valueColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  trend,
  valueColor = 'text-slate-900',
  className = '',
}) => {
  const trendIcon =
    trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />
    ) : trend === 'down' ? (
      <ArrowDownRight className="h-4 w-4 text-rose-600" aria-hidden="true" />
    ) : null;

  return (
    <div
      className={`flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs transition-shadow duration-200 ease-in-out hover:shadow-md ${className}`}
      role="region"
    >
      {icon && (
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-[#00843D] border border-emerald-100">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-500 block truncate">{label}</span>
        <div className="flex items-center mt-1">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${valueColor}`}>
            {value}
          </span>
          {trendIcon && <span className="ml-2">{trendIcon}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
