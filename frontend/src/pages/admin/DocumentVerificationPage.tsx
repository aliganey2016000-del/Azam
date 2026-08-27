import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DocumentRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const DocumentVerificationPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<DocumentRecord | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getDocuments();
      setDocuments(items.filter((d) => d.status === 'PENDING'));
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch pending documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (doc: DocumentRecord) => {
    try {
      await adminService.verifyDocument(doc.id);
      success('Document marked verified.');
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to verify document.');
    }
  };

  const handleReject = async (reason?: string) => {
    if (!rejectTarget) return;
    try {
      await adminService.rejectDocument(rejectTarget.id, reason || '');
      error(`Document rejected.`);
      setRejectTarget(null);
      setRejectOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reject document.');
    }
  };

  const columns: Column<DocumentRecord>[] = [
    {
      key: 'title',
      header: 'Uploaded Document',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.title || item.fileName || 'Academic Transcript'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{item.documentType}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (item) => <span className="font-semibold text-slate-900">{item.student?.fullName || 'Student'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'VERIFIED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}>
          {item.status || 'PENDING'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Verification Decision',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleVerify(item)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Verify
          </button>
          <button
            onClick={() => {
              setRejectTarget(item);
              setRejectOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={rejectOpen}
        onClose={() => {
          setRejectTarget(null);
          setRejectOpen(false);
        }}
        onConfirm={handleReject}
        title="Reject Document"
        message={`Reject "${rejectTarget?.title || rejectTarget?.fileName || 'this document'}"? The applicant will be notified and asked to re-upload.`}
        confirmLabel="Reject Document"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Document is illegible, expired, or does not match the required type..."
      />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Document Verification Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perform compliance checks and authenticate medical credentials submitted by applicants.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        searchPlaceholder="Search pending documents..."
        emptyTitle="No documents in verification queue"
      />
    </div>
  );
};
