import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileQuestion,
  User,
  Building2,
  Calendar,
  Clock,
  Download,
  Check,
  AlertTriangle,
  History,
  FileText,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { ApplicationItem } from '../../types/admin.types';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorState } from '../../components/ui/ErrorState';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'requestDocs' | null>(null);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const app = await adminService.getApplication(id);
      setApplication(app);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Unable to load application file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAction = async (reason?: string) => {
    if (!application || !modalType) return;
    try {
      if (modalType === 'approve') {
        await adminService.approveApplication(application.id, reason);
        success(`Application ${application.applicationNumber} approved.`);
      } else if (modalType === 'reject') {
        await adminService.rejectApplication(application.id, reason || 'Ineligible');
        success(`Application ${application.applicationNumber} rejected.`);
      } else if (modalType === 'requestDocs') {
        await adminService.requestDocuments(application.id, reason || 'Additional documents needed');
        success(`Document request dispatched.`);
      }
      setModalType(null);
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Operation failed.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <LoadingCard lines={8} />
      </div>
    );
  }

  if (errorMsg || !application) {
    return <ErrorState message={errorMsg || 'Application not found'} onRetry={loadData} />;
  }

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Modal Actions */}
      <ConfirmModal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        onConfirm={handleAction}
        title="Approve Application"
        message={`Confirm approval of application ${application.applicationNumber} for clinical attachment placement?`}
        confirmLabel="Approve"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        onConfirm={handleAction}
        title="Reject Application"
        message={`Specify the reason for rejection:`}
        confirmLabel="Reject"
        variant="danger"
        requireReason={true}
      />

      <ConfirmModal
        isOpen={modalType === 'requestDocs'}
        onClose={() => setModalType(null)}
        onConfirm={handleAction}
        title="Request Additional Documents"
        message={`Specify which documents are required from the student:`}
        confirmLabel="Send Request"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="e.g. Please upload your latest verified official academic transcript..."
      />

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/applications')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications List
        </button>

        <div className="flex items-center gap-2">
          {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
            <>
              <button
                onClick={() => setModalType('requestDocs')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <FileQuestion className="w-3.5 h-3.5 text-purple-600" />
                Request Docs
              </button>
              <button
                onClick={() => setModalType('reject')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                onClick={() => setModalType('approve')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Application
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#102f38] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {application.student?.fullName ? application.student.fullName[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">
                  {application.student?.fullName || 'Applicant File'}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold">
                  {application.applicationNumber}
                </span>
                {getStatusBadge(application.status)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Applied on {new Date(application.createdAt).toLocaleDateString()} • Pathway:{' '}
                <strong className="font-semibold text-slate-700">{application.source}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Profile Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Student Demographics
            </h3>
            <div className="bg-slate-50/70 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">{application.student?.fullName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone Contact</span>
                <span className="font-mono text-slate-800">{application.student?.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nationality</span>
                <span className="text-slate-800">{application.student?.nationality || 'Unspecified'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student ID Link</span>
                <NavLink
                  to={`/admin/students/${application.studentId}`}
                  className="text-[#102f38] hover:underline font-semibold"
                >
                  View Complete Profile →
                </NavLink>
              </div>
            </div>
          </div>

          {/* Academic & Placement Preferences */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Academic & Placement Details
            </h3>
            <div className="bg-slate-50/70 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Affiliated University</span>
                <span className="font-semibold text-slate-900">{application.university?.name || 'Independent'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Requested Specialty</span>
                <span className="font-semibold text-slate-900">{application.specialty?.name || 'General Rotation'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Preferred Location</span>
                <span className="text-slate-800">
                  {application.preferredCity?.name || ''} {application.preferredCountry?.name || 'Global'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Requested Rotation Dates</span>
                <span className="font-mono text-slate-800">
                  {application.preferredStartDate || 'Flexible'} to {application.preferredEndDate || 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Interests / Statements */}
        {application.clinicalInterests && (
          <div className="px-6 pb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
              Clinical Statement & Objectives
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {application.clinicalInterests}
            </div>
          </div>
        )}

        {/* Attached Documents */}
        <div className="px-6 pb-6 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Submitted Documents ({application.documents?.length || 0})
          </h3>

          {!application.documents || application.documents.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center">
              No files currently attached to this application record.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {application.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#e26342] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{doc.title || doc.documentType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{doc.status || 'PENDING'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => success('Initiating file download preview.')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Download / View"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
