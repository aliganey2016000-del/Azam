import React, { useEffect, useState } from 'react';
import { Stethoscope, Building2, User } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { SupervisorItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const SupervisorsPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getSupervisors();
      setSupervisors(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch clinical supervisors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<SupervisorItem>[] = [
    {
      key: 'name',
      header: 'Clinical Supervisor',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center font-bold text-xs">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name || 'Dr. Consultant'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{item.user?.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialty',
      header: 'Specialty / Department',
      render: (item) => (
        <div>
          <span className="font-medium text-slate-800">{item.specialty || 'General Surgery'}</span>
          <div className="text-[11px] text-slate-400">{item.department || 'Clinical Division'}</div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Hospital Placement',
      render: (item) => <span>{item.organization?.name || 'Main Hospital'}</span>,
    },
    {
      key: 'placements',
      header: 'Assigned Trainees',
      align: 'center',
      render: (item: any) => {
        const activeCount = item.activeStudentsCount ?? (item.placements?.length || 0);
        return (
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
              {activeCount} active student{activeCount === 1 ? '' : 's'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Credentials Status',
      align: 'center',
      render: () => <Badge variant="success">Verified MD</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Supervisors
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Registered consultant doctors and clinical preceptors supervising medical attachments.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={supervisors}
        loading={loading}
        searchPlaceholder="Search supervisor name, specialty, hospital..."
        emptyTitle="No supervisors listed"
      />
    </div>
  );
};
