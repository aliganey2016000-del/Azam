import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  applications: 'Applications',
  students: 'Students',
  universities: 'Universities',
  organizations: 'Host Organizations',
  supervisors: 'Clinical Supervisors',
  programmes: 'Programmes',
  specialties: 'Specialties',
  placements: 'Placements',
  'clinical-attachments': 'Clinical Attachments',
  attendance: 'Attendance',
  logbooks: 'Digital Logbooks',
  evaluations: 'Evaluations',
  certificates: 'Certificates',
  verification: 'Verification',
  documents: 'Documents',
  notifications: 'Notifications',
  messages: 'Messages',
  reports: 'Reports',
  exports: 'Exports',
  users: 'Users Management',
  'roles-permissions': 'Roles & Permissions',
  'audit-logs': 'Audit Logs',
  settings: 'System Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If on admin or dashboard directly
  if (pathnames.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-semibold">Admin Overview</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <NavLink
        to="/admin/dashboard"
        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </NavLink>

      {pathnames.map((segment, index) => {
        if (segment === 'admin' && index === 0) return null;

        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold truncate max-w-[200px]" aria-current="page">
                {label}
              </span>
            ) : (
              <NavLink
                to={routeTo}
                className="text-slate-500 hover:text-slate-800 transition-colors truncate max-w-[150px]"
              >
                {label}
              </NavLink>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
