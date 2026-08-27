import React from 'react';
import { Layers } from 'lucide-react';

interface UnavailableStateProps {
  title?: string;
  description?: string;
  moduleName?: string;
}

export const UnavailableState: React.FC<UnavailableStateProps> = ({
  title = 'Service Module Pending',
  description = 'This backend service integration is currently pending deployment or requires elevated institutional credentials.',
  moduleName,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center max-w-lg mx-auto my-6">
      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 mx-auto mb-3">
        <Layers className="w-5 h-5" />
      </div>
      {moduleName && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-200 text-slate-700 mb-2">
          {moduleName}
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
};
