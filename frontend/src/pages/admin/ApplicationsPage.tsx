import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { ApplicationItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'ALL';
  const sourceFilter = searchParams.get('source') || 'ALL';

  const setStatusFilter = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'ALL') next.delete('status');
      else next.set('status', val);
      return next;
    });
  };

  const setSourceFilter = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'ALL') next.delete('source');
      else next.set('source', val);
      return next;
    });
  };

  // Modal actions
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'requestDocs' | null>(null);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const items = await adminService.getApplications();
      setApplications(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to retrieve applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredItems = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && app.source !== sourceFilter) return false;
    return true;
  });

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
        return <Badge variant="purple">DOCS REQUIRED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleActionConfirm = async (reason?: string) => {
    if (!selectedApp || !actionType) return;
    try {
      if (actionType === 'approve') {
        await adminService.approveApplication(selectedApp.id, reason);
        success(`Application ${selectedApp.applicationNumber} approved successfully.`);
      } else if (actionType === 'reject') {
        await adminService.rejectApplication(selectedApp.id, reason || 'Does not meet criteria');
        success(`Application ${selectedApp.applicationNumber} rejected.`);
      } else if (actionType === 'requestDocs') {
        await adminService.requestDocuments(selectedApp.id, reason || 'Additional credentials required');
        success(`Document request sent for ${selectedApp.applicationNumber}.`);
      }
      setSelectedApp(null);
      setActionType(null);
      loadApplications();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Action could not be completed.');
    }
  };

  const columns: Column<ApplicationItem>[] = [
    {
      key: 'applicationNumber',
      header: 'App #',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-slate-900">{item.applicationNumber}</span>
      ),
    },
    {
      key: 'student',
      header: 'Applicant',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.student?.fullName || '—'}</div>
          <div className="text-[11px] text-slate-500">{item.student?.nationality || 'Nationality Unspecified'}</div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Pathway',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
          {item.source}
        </span>
      ),
    },
    {
      key: 'specialty',
      header: 'Specialty / Programme',
      render: (item) => (
        <div>
          <div className="font-medium text-slate-800">{item.specialty?.name || item.programme?.name || 'General'}</div>
          <div className="text-[11px] text-slate-400">{item.university?.name || item.organization?.name || 'Independent'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Action',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/applications/${item.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status !== 'APPROVED' && item.status !== 'REJECTED' && (
            <>
              <button
                onClick={() => {
                  setSelectedApp(item);
                  setActionType('approve');
                }}
                className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                title="Approve Application"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedApp(item);
                  setActionType('reject');
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                title="Reject Application"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Modals */}
      <ConfirmModal
        isOpen={actionType === 'approve'}
        onClose={() => {
          setSelectedApp(null);
          setActionType(null);
        }}
        onConfirm={handleActionConfirm}
        title="Approve Clinical Attachment Application"
        message={`Are you sure you want to approve application ${selectedApp?.applicationNumber}? This will mark the student eligible for clinical placement.`}
        confirmLabel="Approve Application"
        variant="primary"
        requireReason={false}
      />

      <ConfirmModal
        isOpen={actionType === 'reject'}
        onClose={() => {
          setSelectedApp(null);
          setActionType(null);
        }}
        onConfirm={handleActionConfirm}
        title="Reject Application"
        message={`Please provide a reason for rejecting application ${selectedApp?.applicationNumber}.`}
        confirmLabel="Reject Application"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Ineligible academic standing, incomplete prerequisite documents..."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Applications Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, triage, and record decisions for medical student clinical attachment applications.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        searchPlaceholder="Search by applicant name, app number, specialty..."
        searchFilter={(item, q) =>
          item.applicationNumber.toLowerCase().includes(q.toLowerCase()) ||
          (item.student?.fullName || '').toLowerCase().includes(q.toLowerCase()) ||
          (item.specialty?.name || '').toLowerCase().includes(q.toLowerCase())
        }
        filterOptions={[
          {
            label: 'Status',
            key: 'status',
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Docs Required', value: 'DOCUMENTS_REQUIRED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
            selectedValue: statusFilter,
            onChange: setStatusFilter,
          },
          {
            label: 'Pathway',
            key: 'source',
            options: [
              { label: 'All Pathways', value: 'ALL' },
              { label: 'University', value: 'UNIVERSITY' },
              { label: 'Organization', value: 'ORGANIZATION' },
              { label: 'Independent', value: 'INDEPENDENT' },
            ],
            selectedValue: sourceFilter,
            onChange: setSourceFilter,
          },
        ]}
        onRowClick={(item) => navigate(`/admin/applications/${item.id}`)}
        emptyTitle="No applications found"
        emptyDescription="No applications match the current filter selection."
      />
    </div>
  );
};
