import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Settings, LogOut, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const initials = (user?.fullName || user?.email || 'AD')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const primaryRole = user?.roles?.[0] || 'STAFF';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center text-xs font-bold shadow-xs">
          {initials}
        </div>
        <div className="hidden md:flex flex-col min-w-0 pr-1">
          <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
            {user?.fullName || user?.email?.split('@')[0] || 'Administrator'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
            {primaryRole.replace('_', ' ')}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.fullName || 'AZAAM Administrator'}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#102f38]/10 text-[#102f38] text-[10px] font-mono font-bold uppercase">
              <Shield className="w-2.5 h-2.5" />
              {primaryRole}
            </div>
          </div>

          <div className="py-1">
            <NavLink
              to="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Account Settings
            </NavLink>
            <NavLink
              to="/admin/roles-permissions"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Role & Permissions
            </NavLink>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
