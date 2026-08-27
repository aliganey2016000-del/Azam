import React, { useEffect, useState } from 'react';
import { History, ShieldAlert, User, Terminal } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { AuditLogRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getAuditLogs();
      setLogs(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<AuditLogRecord>[] = [
    {
      key: 'action',
      header: 'Security Action',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
          {item.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity / Target',
      render: (item) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{item.entity}</span>
          {item.entityId && (
            <span className="text-[10px] text-slate-400 font-mono block">ID: {item.entityId}</span>
          )}
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: 'Actor / User',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.userEmail || 'system@azam.test'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Audit Trail & Security Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable forensic logs recording all administrative decisions, profile modifications, and certificate issuance events.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit logs by action, user..."
        emptyTitle="No audit records logged"
      />
    </div>
  );
};
