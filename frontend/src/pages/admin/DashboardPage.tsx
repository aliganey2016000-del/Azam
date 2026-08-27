import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  School,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { AdminSummary, ApplicationItem } from '../../types/admin.types';
import { KpiCard } from '../../components/ui/KpiCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorState } from '../../components/ui/ErrorState';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [recentApplications, setRecentApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumData, apps] = await Promise.all([
        adminService.getSummary(),
        adminService.getApplications(),
      ]);
      setSummary(sumData);
      setRecentApplications(apps.slice(0, 5));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load dashboard operational metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PLACED':
      case 'ACTIVE':
        return <Badge variant="success">{status}</Badge>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Badge variant="warning">{status}</Badge>;
      case 'DOCUMENTS_REQUIRED':
        return <Badge variant="purple">DOCS NEEDED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time management overview of students, clinical applications, placements, and institutional partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink
            to="/admin/applications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e26342] hover:bg-[#d55332] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Review Queue
          </NavLink>
          <NavLink
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            Analytics
          </NavLink>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Students"
          value={summary?.students ?? 0}
          icon={Users}
          description="Registered medical learners"
          variant="default"
          loading={loading}
        />
        <KpiCard
          title="Pending Review"
          value={summary?.pendingApplications ?? 0}
          icon={Clock}
          description="Applications awaiting triage"
          variant="accent"
          loading={loading}
          trend={{ value: 'Action Required', isPositive: false }}
        />
        <KpiCard
          title="Approved Attachments"
          value={summary?.approvedApplications ?? 0}
          icon={CheckCircle2}
          description="Cleared for clinical placement"
          variant="emerald"
          loading={loading}
        />
        <KpiCard
          title="Institutional Network"
          value={(summary?.universities ?? 0) + (summary?.organizations ?? 0)}
          icon={Building2}
          description={`${summary?.universities ?? 0} Universities, ${summary?.organizations ?? 0} Host Orgs`}
          variant="default"
          loading={loading}
        />
      </div>

      {/* Main Grid: Pending Applications + Quick Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Triage List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#e26342]" />
              <h2 className="text-sm font-bold text-slate-900">Recent Applications Queue</h2>
            </div>
            <NavLink
              to="/admin/applications"
              className="text-xs font-semibold text-[#102f38] hover:text-[#e26342] flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-5">
                <LoadingCard lines={4} />
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No applications currently in queue.
              </div>
            ) : (
              recentApplications.map((app) => (
                <NavLink
                  key={app.id}
                  to={`/admin/applications/${app.id}`}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#102f38] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#102f38] group-hover:text-white transition-colors">
                      {app.student?.fullName ? app.student.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {app.student?.fullName || 'Anonymous Applicant'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {app.applicationNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {app.specialty?.name || 'General Clinical Attachment'} •{' '}
                        {app.university?.name || app.source}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(app.status)}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                  </div>
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Operational Pathways */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Admin Actions
            </h2>

            <div className="space-y-2">
              <NavLink
                to="/admin/certificates/verification"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-medium text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Verify Student Certificate</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </NavLink>

              <NavLink
                to="/admin/placements"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-medium text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-[#102f38]" />
                  <span>Manage Placements & Supervisors</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </NavLink>

              <NavLink
                to="/admin/documents/verification"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-medium text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#e26342]" />
                  <span>Verify Uploaded Documents</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </NavLink>
            </div>
          </div>

          {/* Institutional Breakdown Card */}
          <div className="bg-[#102f38] text-white rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">
                Partner Networks
              </h3>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <NavLink
                to="/admin/universities"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <School className="w-4 h-4 text-sky-300 mb-1.5" />
                <div className="text-lg font-bold">{summary?.universities ?? 0}</div>
                <div className="text-[11px] text-white/60">Universities</div>
              </NavLink>

              <NavLink
                to="/admin/organizations"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Building2 className="w-4 h-4 text-emerald-300 mb-1.5" />
                <div className="text-lg font-bold">{summary?.organizations ?? 0}</div>
                <div className="text-[11px] text-white/60">Host Hospitals</div>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
