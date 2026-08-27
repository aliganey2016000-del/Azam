import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Forbidden403Page: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 mb-2">
        HTTP 403 • FORBIDDEN
      </span>

      <h1 className="text-xl font-bold text-slate-900 mb-2">
        Restricted Administrative Access
      </h1>

      <p className="text-xs text-slate-600 leading-relaxed mb-6">
        Your current user account ({user?.email || 'authenticated session'}) does not possess the elevated role permissions required to access the AZAAM Admin Control Center.
      </p>

      <div className="flex items-center gap-3">
        <NavLink
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Home className="w-3.5 h-3.5" /> Return Home
        </NavLink>
        <NavLink
          to="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold transition-colors"
        >
          Switch Account
        </NavLink>
      </div>
    </div>
  );
};
