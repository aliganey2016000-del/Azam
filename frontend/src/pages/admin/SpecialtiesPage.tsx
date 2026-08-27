import React, { useEffect, useState } from 'react';
import { Activity, Stethoscope } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const SpecialtiesPage: React.FC = () => {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    adminService
      .getSpecialties()
      .then((data) => setSpecialties(data))
      .catch((err) => error(err?.response?.data?.message || 'Failed to load specialties.'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Clinical Specialty',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">Code: {item.code || 'MED-SPEC'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Scope Description',
      render: (item) => (
        <span className="text-xs text-slate-600">
          {item.description || 'Core clinical rotation specialty curriculum'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: () => <Badge variant="success">Active</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Specialties
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Medical and surgical clinical rotation specialties available for attachment placement.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={specialties}
        loading={loading}
        searchPlaceholder="Search specialties..."
        emptyTitle="No specialties found"
      />
    </div>
  );
};
