import React from 'react';
import { NavLink } from 'react-router-dom';
import { HelpCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const NotFound404Page: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 mb-2">
        HTTP 404 • PAGE NOT FOUND
      </span>

      <h1 className="text-xl font-bold text-slate-900 mb-2">
        Admin Module Not Found
      </h1>

      <p className="text-xs text-slate-600 leading-relaxed mb-6">
        The requested administrative route does not exist or has been relocated.
      </p>

      <NavLink
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold shadow-xs transition-colors"
      >
        <LayoutDashboard className="w-3.5 h-3.5" /> Back to Dashboard
      </NavLink>
    </div>
  );
};
