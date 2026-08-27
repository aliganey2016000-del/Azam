import React from 'react';
import { Menu, HelpCircle, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsMenu } from './NotificationsMenu';
import { UserMenu } from './UserMenu';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenHelpModal?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenHelpModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 transition-all">
      {/* Left side: Hamburger on mobile + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block min-w-0">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right side: Global Search + System Status Badge + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>AZAAM Core API Online</span>
        </div>

        {onOpenHelpModal && (
          <button
            onClick={onOpenHelpModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:block"
            title="Help & Master Workflow Reference"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <NotificationsMenu scope="admin" />

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        <UserMenu />
      </div>
    </header>
  );
};
