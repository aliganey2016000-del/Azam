import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'accent' | 'emerald' | 'amber';
  loading?: boolean;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  loading = false,
  onClick,
}) => {
  const iconVariants = {
    default: 'bg-slate-100 text-[#102f38]',
    accent: 'bg-orange-50 text-[#e26342]',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-between h-[120px]">
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 rounded w-24" />
          <div className="w-9 h-9 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-7 bg-slate-200 rounded w-16" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {trend && (
          <div
            className={`inline-flex items-center text-xs font-semibold gap-0.5 ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-400 mt-2 font-normal truncate">
          {description}
        </p>
      )}
    </div>
  );
};
