import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { CertificateRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getCertificates();
      setCertificates(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (reason?: string) => {
    if (!selectedCert) return;
    try {
      await adminService.revokeCertificate(selectedCert.id, reason || 'Administrative revocation');
      success(`Certificate ${selectedCert.certificateNumber} revoked.`);
      setSelectedCert(null);
      setRevokeOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Revocation failed.');
    }
  };

  const columns: Column<CertificateRecord>[] = [
    {
      key: 'certificateNumber',
      header: 'Certificate No.',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-slate-900">{item.certificateNumber}</span>
      ),
    },
    {
      key: 'student',
      header: 'Recipient Student',
      render: (item) => (
        <div className="font-semibold text-slate-900">
          {item.recipientName || item.student?.fullName || 'Student Doctor'}
        </div>
      ),
    },
    {
      key: 'programme',
      header: 'Specialty / Programme',
      render: (item) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{item.specialtyName || item.programmeName || 'Clinical Attachment'}</span>
          <div className="text-[11px] text-slate-400">{item.institutionName || 'AZAAM Network Hospital'}</div>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(item.issueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Validity Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'VALID' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <NavLink
            to={`/admin/certificates/verification?number=${item.certificateNumber}`}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Public Verification View"
          >
            <ExternalLink className="w-4 h-4" />
          </NavLink>
          {item.status === 'VALID' && (
            <button
              onClick={() => {
                setSelectedCert(item);
                setRevokeOpen(true);
              }}
              className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
              title="Revoke Certificate"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={revokeOpen}
        onClose={() => {
          setSelectedCert(null);
          setRevokeOpen(false);
        }}
        onConfirm={handleRevoke}
        title="Revoke Clinical Certificate"
        message={`Are you sure you want to revoke certificate ${selectedCert?.certificateNumber}? Once revoked, public verification queries will report this certificate as invalidated.`}
        confirmLabel="Revoke Certificate"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Failure to meet required attendance quota..."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Certificates Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official records of verified clinical attachment completion certificates issued by AZAAM.
          </p>
        </div>

        <NavLink
          to="/admin/certificates/verification"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verification Lookup Tool
        </NavLink>
      </div>

      <DataTable
        columns={columns}
        data={certificates}
        loading={loading}
        searchPlaceholder="Search certificate number, student name..."
        emptyTitle="No certificates issued yet"
      />
    </div>
  );
};
