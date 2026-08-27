import React from 'react';

export type BadgeVariant = 'count' | 'warning' | 'success' | 'neutral' | 'accent';

interface SidebarBadgeProps {
  count?: number | string;
  variant?: BadgeVariant;
  label?: string;
}

export const SidebarBadge: React.FC<SidebarBadgeProps> = ({
  count,
  variant = 'neutral',
  label,
}) => {
  if (count === undefined && !label) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'count':
      case 'accent':
        return 'bg-[#e26342] text-white font-semibold';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'neutral':
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full min-w-[20px] leading-none transition-colors ${getVariantStyles()}`}
    >
      {label || count}
    </span>
  );
};
