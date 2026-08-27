import React, { useEffect, useState } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const ProgrammesPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    adminService
      .getProgrammes()
      .then((data) => setProgrammes(data))
      .catch((err) => error(err?.response?.data?.message || 'Failed to load programmes.'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Programme / Degree Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#e26342] flex items-center justify-center font-bold text-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">Level: {item.level || 'Undergraduate'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'durationMonths',
      header: 'Standard Duration',
      align: 'center',
      render: (item) => (
        <span className="font-mono text-xs">{item.durationMonths ? `${item.durationMonths} Months` : '4–12 Weeks'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Curriculum Status',
      align: 'center',
      render: () => <Badge variant="success">Active</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Academic Programmes Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Standardized clinical training and medical degree curricula supported across the network.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={programmes}
        loading={loading}
        searchPlaceholder="Search programme title..."
        emptyTitle="No programmes registered"
      />
    </div>
  );
};
