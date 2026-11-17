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
      className={`p-4 bg-white rounded-xl border border-slate-200 shadow-xs transition-shadow duration-200 ease-in-out hover:shadow-md flex flex-col justify-between ${className}`}
      role="region"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 leading-snug">
          {label}
        </span>
        {icon && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#00843D] border border-emerald-100">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${valueColor}`}>
            {value}
          </span>
          {trendIcon && <span className="ml-2">{trendIcon}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
