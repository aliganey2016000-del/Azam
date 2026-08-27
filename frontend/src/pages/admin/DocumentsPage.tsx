import React, { useEffect, useState } from 'react';
import { FolderClosed, FileCheck, Download, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DocumentRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getDocuments();
      setDocuments(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<DocumentRecord>[] = [
    {
      key: 'title',
      header: 'Document Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#e26342] flex items-center justify-center font-bold text-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.title || item.fileName || 'Academic Record'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{item.documentType}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student Owner',
      render: (item) => (
        <span className="font-medium text-slate-800">{item.student?.fullName || 'Student Doctor'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'VERIFIED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}>
          {item.status || 'PENDING'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Uploaded Date',
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => success('File preview opened.')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          title="Download File"
        >
          <Download className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Documents Repository
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Secure central archive for student passports, medical transcripts, recommendation letters, and immunization records.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        searchPlaceholder="Search documents by title, type, student..."
        emptyTitle="No documents in repository"
      />
    </div>
  );
};
