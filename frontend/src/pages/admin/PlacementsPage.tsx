import React, { useEffect, useState } from 'react';
import { CalendarCheck, Building2, UserCheck, Award, Plus, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PlacementItem, SupervisorItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { useToast } from '../../context/ToastContext';

export const PlacementsPage: React.FC = () => {
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign Supervisor Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementItem | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pItems, sItems] = await Promise.all([
        adminService.getPlacements(),
        adminService.getSupervisors(),
      ]);
      setPlacements(pItems);
      setSupervisors(sItems);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch clinical placements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement || !selectedSupervisorId) return;
    setSubmitting(true);
    try {
      await adminService.assignSupervisor(selectedPlacement.id, selectedSupervisorId);
      success('Preceptor assigned to placement successfully!');
      setAssignModalOpen(false);
      setSelectedPlacement(null);
      setSelectedSupervisorId('');
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to assign supervisor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueCert = async (placement: PlacementItem) => {
    const attachmentId = placement.attachment?.id || placement.id;
    try {
      await adminService.issueCertificate(attachmentId);
      success(`Certificate issued for ${placement.student?.fullName || 'student'}`);
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Certificate issuance failed.');
    }
  };

  const activeCount = placements.filter((p) => p.status === 'ACTIVE' || p.status === 'SUPERVISOR_ASSIGNED').length;
  const completedCount = placements.filter((p) => p.status === 'COMPLETED' || p.status === 'CERTIFICATE_ISSUED').length;

  const columns: Column<PlacementItem>[] = [
    {
      key: 'student',
      header: 'Student Doctor',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#102f38] text-white flex items-center justify-center font-bold text-xs">
            {item.student?.fullName ? item.student.fullName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.student?.fullName || 'Student Doctor'}</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: {item.student?.id?.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Hospital & Department',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-800">{item.organization?.name || 'Teaching Hospital'}</div>
          <div className="text-[11px] text-slate-400">{item.department?.name || 'Department of Medicine'}</div>
        </div>
      ),
    },
    {
      key: 'supervisor',
      header: 'Assigned Preceptor',
      render: (item) => (
        item.supervisor?.user?.fullName ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{item.supervisor.user.fullName}</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlacement(item);
              setAssignModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Plus className="w-3 h-3 text-amber-600" />
            Assign Preceptor
          </button>
        )
      ),
    },
    {
      key: 'dates',
      header: 'Rotation Interval',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Rotation Status',
      align: 'center',
      render: (item) => {
        switch (item.status) {
          case 'ACTIVE':
          case 'SUPERVISOR_ASSIGNED':
            return <Badge variant="success">ACTIVE ROTATION</Badge>;
          case 'COMPLETED':
            return <Badge variant="info">COMPLETED</Badge>;
          case 'CERTIFICATE_ISSUED':
            return <Badge variant="success">CERTIFIED</Badge>;
          default:
            return <Badge variant="default">{item.status}</Badge>;
        }
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!item.supervisorId && (
            <button
              onClick={() => {
                setSelectedPlacement(item);
                setAssignModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Assign Preceptor
            </button>
          )}
          {item.status === 'COMPLETED' && (
            <button
              onClick={() => handleIssueCert(item)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              Issue Cert
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Assign Supervisor Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedPlacement(null);
        }}
        title="Assign Clinical Preceptor / Supervisor"
        maxWidth="md"
      >
        <form onSubmit={handleAssignSupervisor} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Clinical Supervisor:</label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
            >
              <option value="">-- Choose Supervisor --</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.fullName || 'Dr. Supervisor'} ({s.organization?.name || 'Hospital'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSupervisorId}
              className="px-4 py-2 rounded-xl bg-[#102f38] text-white font-semibold hover:bg-[#102f38]/90 disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Preceptor'}
            </button>
          </div>
        </form>
      </Modal>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Placements Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor active student hospital rotations, assign verified clinical preceptors, and issue completion credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Rotations"
          value={placements.length}
          description="All recorded clinical attachments"
          icon={CalendarCheck}
          variant="default"
        />
        <KpiCard
          title="Active Trainees"
          value={activeCount}
          description="Currently on hospital rotation"
          icon={Building2}
          variant="emerald"
        />
        <KpiCard
          title="Completed Attachments"
          value={completedCount}
          description="Finished clinical evaluation"
          icon={Award}
          variant="accent"
        />
      </div>

      <DataTable
        columns={columns}
        data={placements}
        loading={loading}
        searchPlaceholder="Search placements by student or hospital..."
        emptyTitle="No clinical placements active"
      />
    </div>
  );
};

