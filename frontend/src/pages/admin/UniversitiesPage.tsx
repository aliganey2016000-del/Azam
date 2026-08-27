import React, { useEffect, useState } from 'react';
import { School, Building2, Globe, Mail, MapPin } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { UniversityItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const UniversitiesPage: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getUniversities();
      setUniversities(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch universities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<UniversityItem>[] = [
    {
      key: 'name',
      header: 'University Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
            <School className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">Code: {item.code || 'UNIV'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location',
      render: (item) => <span>{item.address || 'International'}</span>,
    },
    {
      key: 'contactEmail',
      header: 'Coordinator Contact',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.contactEmail || 'admin@university.test'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Partner Status',
      align: 'center',
      render: () => <Badge variant="success">Accredited</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Partner Universities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Academic institutions partnering with AZAAM for structured student clinical attachments.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={universities}
        loading={loading}
        searchPlaceholder="Search university name, code, contact..."
        emptyTitle="No universities listed"
      />
    </div>
  );
};
