import React from 'react';

interface LoadingCardProps {
  lines?: number;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-100 rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
};
