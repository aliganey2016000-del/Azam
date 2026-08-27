import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { HelpModal } from './HelpModal';
import { ToastContainer } from '../ui/ToastContainer';
import { adminService } from '../../services/admin.service';

export const AdminLayout: React.FC = () => {
  const { user, loading, hasAnyRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('azam_sidebar_collapsed') === 'true';
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState<{
    pendingApplications?: number;
    unverifiedDocs?: number;
    activePlacements?: number;
  }>({});

  useEffect(() => {
    localStorage.setItem('azam_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (user && (user.roles.includes('SUPER_ADMIN') || user.roles.includes('AZAAM_STAFF'))) {
      adminService
        .getSummary()
        .then((summary) => {
          setSummaryCounts({
            pendingApplications: summary.pendingApplications || 0,
            activePlacements: summary.activePlacements || summary.activeApplications || 0,
            unverifiedDocs: 0,
          });
        })
        .catch(() => {
          // ignore
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-white/20 border-t-[#e26342] rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-white/70">Connecting to AZAAM Admin Core...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, but not an admin or staff, redirect to 403 or their dashboard
  const isStaffOrAdmin = hasAnyRole(['SUPER_ADMIN', 'AZAAM_STAFF']);
  if (!isStaffOrAdmin) {
    return <Navigate to="/admin/403" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Workflow Reference Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Navigation Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        summaryCounts={summaryCounts}
      />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          onOpenHelpModal={() => setHelpOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
