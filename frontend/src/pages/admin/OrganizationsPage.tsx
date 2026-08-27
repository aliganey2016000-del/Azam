import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { OrganizationItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getOrganizations();
      setOrganizations(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch host organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<OrganizationItem>[] = [
    {
      key: 'name',
      header: 'Hospital / Clinical Center',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-400">
              {item.departmentsCount ? `${item.departmentsCount} Departments` : 'Teaching Hospital'} • {item.supervisorsCount || 0} Preceptors
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location / Contact',
      render: (item) => (
        <div className="text-xs">
          <div className="text-slate-700">{item.address || 'Clinical Facility'}</div>
          <div className="text-[11px] text-slate-400 font-mono">{item.contactEmail || 'coordinator@hospital.test'}</div>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Rotation Capacity',
      align: 'center',
      render: (item) => {
        const total = item.totalCapacity ?? 20;
        const occupied = item.occupiedCapacity ?? 0;
        const available = item.availableCapacity ?? (total - occupied);
        const isFull = occupied >= total;

        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-900">{occupied}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">{total} slots</span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isFull ? 'bg-rose-500' : occupied > total * 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (occupied / total) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">{available} available</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status & Warning',
      align: 'center',
      render: (item) => {
        const isFull = (item.occupiedCapacity ?? 0) >= (item.totalCapacity ?? 20);
        return isFull ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Capacity Reached
          </span>
        ) : (
          <Badge variant="success">Active Host</Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Host Organizations & Teaching Hospitals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Accredited clinical healthcare facilities hosting medical student rotations and placements with capacity metrics.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={organizations}
        loading={loading}
        searchPlaceholder="Search host organization, hospital name..."
        emptyTitle="No host organizations found"
      />
    </div>
  );
};

