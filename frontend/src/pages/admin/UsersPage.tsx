import React, { useEffect, useState } from 'react';
import { UserCog, Shield, CheckCircle2, XCircle, Mail, User } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getUsers();
      setUsers(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'email',
      header: 'User Account / Email',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center font-bold text-xs">
            {item.email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.student?.fullName || item.email.split('@')[0]}</div>
            <div className="text-[11px] text-slate-400 font-mono">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Assigned Roles',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.roles || []).map((r: any) => (
            <span
              key={r.role?.name || r}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-800"
            >
              {r.role?.name || r}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System Users & Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage staff, student, university coordinators, and supervisor credentials across the network.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by email..."
        emptyTitle="No users registered"
      />
    </div>
  );
};
