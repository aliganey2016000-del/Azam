import React, { useEffect, useState } from 'react';
import { FileCheck, CheckCircle2, XCircle, Download, FileText } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DocumentRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const DocumentVerificationPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getDocuments();
      setDocuments(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch pending documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDoc = (docId: string, verified: boolean) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: verified ? 'VERIFIED' : 'REJECTED' } : d))
    );
    if (verified) success('Document marked verified.');
    else error('Document rejected.');
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
            onClick={() => handleVerifyDoc(item.id, true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Verify
          </button>
          <button
            onClick={() => handleVerifyDoc(item.id, false)}
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
