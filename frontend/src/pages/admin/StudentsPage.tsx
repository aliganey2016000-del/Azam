import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, CheckCircle2, AlertCircle, School, Building2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { StudentItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const navigate = useNavigate();
  const { error } = useToast();

  const loadStudents = async () => {
    setLoading(true);
    try {
      const items = await adminService.getStudents();
      setStudents(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter((s) => {
    if (sourceFilter !== 'ALL' && s.source !== sourceFilter) return false;
    return true;
  });

  const columns: Column<StudentItem>[] = [
    {
      key: 'fullName',
      header: 'Full Name & Email',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center text-xs font-bold">
            {item.fullName ? item.fullName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.fullName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{item.user?.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'nationality',
      header: 'Nationality',
      render: (item) => <span>{item.nationality || 'Unspecified'}</span>,
    },
    {
      key: 'source',
      header: 'Pathway',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
          {item.source}
        </span>
      ),
    },
    {
      key: 'university',
      header: 'Institution',
      render: (item) => (
        <div className="text-xs">
          {item.university?.name || item.organization?.name || <span className="text-slate-400">Independent</span>}
        </div>
      ),
    },
    {
      key: 'profileCompleted',
      header: 'Profile Status',
      align: 'center',
      render: (item) =>
        item.profileCompleted ? (
          <Badge variant="success">Completed</Badge>
        ) : (
          <Badge variant="warning">Incomplete</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/students/${item.id}`);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          title="View Student File"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Medical Students Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore registered student profiles, academic affiliations, contact details, and clinical journey history.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search students by name, email, nationality..."
        searchFilter={(item, q) =>
          item.fullName.toLowerCase().includes(q.toLowerCase()) ||
          (item.user?.email || '').toLowerCase().includes(q.toLowerCase()) ||
          (item.nationality || '').toLowerCase().includes(q.toLowerCase())
        }
        filterOptions={[
          {
            label: 'Pathway',
            key: 'source',
            options: [
              { label: 'All Pathways', value: 'ALL' },
              { label: 'University', value: 'UNIVERSITY' },
              { label: 'Organization', value: 'ORGANIZATION' },
              { label: 'Independent', value: 'INDEPENDENT' },
            ],
            selectedValue: sourceFilter,
            onChange: setSourceFilter,
          },
        ]}
        onRowClick={(item) => navigate(`/admin/students/${item.id}`)}
        emptyTitle="No student records found"
      />
    </div>
  );
};
