import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  School,
  Building2,
  Stethoscope,
  GraduationCap,
  Activity,
  CalendarCheck,
  MapPin,
  Clock,
  BookOpen,
  ClipboardCheck,
  Award,
  CheckCircle2,
  FolderClosed,
  FileCheck,
  Bell,
  MessageSquare,
  BarChart3,
  DownloadCloud,
  UserCog,
  Shield,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { SidebarBadge } from '../ui/SidebarBadge';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  summaryCounts?: {
    pendingApplications?: number;
    unverifiedDocs?: number;
    activePlacements?: number;
  };
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    key: 'pendingApplications' | 'unverifiedDocs' | 'activePlacements';
    variant: 'count' | 'warning' | 'success';
  };
  permission?: string;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
  summaryCounts,
}) => {
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Dashboard',
          to: '/admin/dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Applications',
          to: '/admin/applications',
          icon: FileText,
          badge: {
            key: 'pendingApplications',
            variant: 'count',
          },
        },
        {
          label: 'Students Directory',
          to: '/admin/students',
          icon: Users,
        },
        {
          label: 'Universities',
          to: '/admin/universities',
          icon: School,
        },
        {
          label: 'Host Organizations',
          to: '/admin/organizations',
          icon: Building2,
        },
        {
          label: 'Supervisors',
          to: '/admin/supervisors',
          icon: Stethoscope,
        },
      ],
    },
    {
      title: 'Academic & Training',
      items: [
        {
          label: 'Programmes',
          to: '/admin/programmes',
          icon: GraduationCap,
        },
        {
          label: 'Specialties',
          to: '/admin/specialties',
          icon: Activity,
        },
        {
          label: 'Placements',
          to: '/admin/placements',
          icon: CalendarCheck,
          badge: {
            key: 'activePlacements',
            variant: 'success',
          },
        },
        {
          label: 'Clinical Attachments',
          to: '/admin/clinical-attachments',
          icon: MapPin,
        },
        {
          label: 'Attendance Records',
          to: '/admin/attendance',
          icon: Clock,
        },
        {
          label: 'Digital Logbooks',
          to: '/admin/logbooks',
          icon: BookOpen,
        },
        {
          label: 'Evaluations',
          to: '/admin/evaluations',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: 'Certification & Files',
      items: [
        {
          label: 'Certificates Registry',
          to: '/admin/certificates',
          icon: Award,
        },
        {
          label: 'Verify Certificate',
          to: '/admin/certificates/verification',
          icon: CheckCircle2,
        },
        {
          label: 'Documents Vault',
          to: '/admin/documents',
          icon: FolderClosed,
        },
        {
          label: 'Doc Verification',
          to: '/admin/documents/verification',
          icon: FileCheck,
          badge: {
            key: 'unverifiedDocs',
            variant: 'warning',
          },
        },
      ],
    },
    {
      title: 'Communication & Data',
      items: [
        {
          label: 'Notifications',
          to: '/admin/notifications',
          icon: Bell,
        },
        {
          label: 'Staff Messages',
          to: '/admin/messages',
          icon: MessageSquare,
        },
        {
          label: 'Reports & Analytics',
          to: '/admin/reports',
          icon: BarChart3,
        },
        {
          label: 'Data Exports',
          to: '/admin/exports',
          icon: DownloadCloud,
        },
      ],
    },
    {
      title: 'System & Security',
      items: [
        {
          label: 'Users Management',
          to: '/admin/users',
          icon: UserCog,
        },
        {
          label: 'Roles & Permissions',
          to: '/admin/roles-permissions',
          icon: Shield,
        },
        {
          label: 'Audit Trail Logs',
          to: '/admin/audit-logs',
          icon: History,
        },
        {
          label: 'System Settings',
          to: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#102f38] text-slate-200 select-none border-r border-[#102f38]/60">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <NavLink to="/admin/dashboard" onClick={onCloseMobile} className="block">
          <Logo collapsed={collapsed} />
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1 rounded text-white/60 hover:text-white lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[11px] font-bold tracking-wider uppercase text-white/40 font-mono">
                {group.title}
              </div>
            )}

            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                const badgeCount = item.badge && summaryCounts
                  ? summaryCounts[item.badge.key]
                  : undefined;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative group ${
                      isActive
                        ? 'bg-[#e26342] text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!collapsed && badgeCount !== undefined && badgeCount > 0 && (
                      <SidebarBadge
                        count={badgeCount}
                        variant={item.badge?.variant}
                      />
                    )}

                    {collapsed && badgeCount !== undefined && badgeCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e26342] ring-2 ring-[#102f38]" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls: Collapse Toggle on Desktop + Public Portal Link */}
      <div className="p-3 border-t border-white/10 bg-black/20 shrink-0 space-y-2">
        <NavLink
          to="/"
          target="_blank"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${
            collapsed ? 'justify-center px-1' : ''
          }`}
          title="Open Public Portal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {!collapsed && <span className="truncate">Public Website</span>}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 z-40 fixed top-0 bottom-0 left-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
