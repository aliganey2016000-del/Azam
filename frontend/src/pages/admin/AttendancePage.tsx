import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { AttendanceRecord, PlacementItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { useToast } from '../../context/ToastContext';

export const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedPlacementId, setSelectedPlacementId] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [statusVal, setStatusVal] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED'>('PRESENT');
  const [commentVal, setCommentVal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [attItems, pItems] = await Promise.all([
        adminService.getAttendance(),
        adminService.getPlacements(),
      ]);
      setAttendance(attItems);
      setPlacements(pItems);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacementId) return;

    const placement = placements.find((p) => p.id === selectedPlacementId);
    const attachmentId = placement?.attachment?.id || placement?.id;

    if (!attachmentId) {
      error('Selected placement has no valid clinical attachment ID.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.recordAttendance(attachmentId, {
        date: dateStr,
        status: statusVal,
        comment: commentVal,
      });
      success('Clinical attendance shift recorded successfully.');
      setRecordModalOpen(false);
      setSelectedPlacementId('');
      setCommentVal('');
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRecords = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const absenceCount = attendance.filter((a) => a.status === 'ABSENT').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success">PRESENT</Badge>;
      case 'LATE':
        return <Badge variant="warning">LATE</Badge>;
      case 'EXCUSED':
        return <Badge variant="info">EXCUSED</Badge>;
      case 'ABSENT':
        return <Badge variant="danger">ABSENT</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'student',
      header: 'Student Doctor',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-slate-900">{item.student?.fullName || item.attachment?.placement?.student?.fullName || 'Student Doctor'}</div>
      ),
    },
    {
      key: 'date',
      header: 'Rotation Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(item.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Shift Clock Time',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'} – {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '04:00 PM'}
        </span>
      ),
    },
    {
      key: 'comment',
      header: 'Duty Notes / Ward',
      render: (item) => (
        <span className="text-xs text-slate-500">{item.comment || 'General Clinical Ward Round'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Attendance Status',
      align: 'center',
      render: (item) => getStatusBadge(item.status),
    },
  ];

  return (
    <div className="space-y-6">
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Clinical Ward Shift Attendance"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Active Trainee / Placement:</label>
            <select
              value={selectedPlacementId}
              onChange={(e) => setSelectedPlacementId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
            >
              <option value="">-- Choose Trainee Placement --</option>
              {placements.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.student?.fullName || 'Student'} ({p.organization?.name || 'Hospital'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shift Date:</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attendance Verification Status:</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
            >
              <option value="PRESENT">PRESENT - Full Ward Duty Completed</option>
              <option value="EXCUSED">EXCUSED - Authorized Academic Leave</option>
              <option value="ABSENT">ABSENT - Unexcused Absence</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preceptor Ward Notes:</label>
            <input
              type="text"
              value={commentVal}
              onChange={(e) => setCommentVal(e.target.value)}
              placeholder="e.g. ICU Morning Rounds & Surgical Assist"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPlacementId}
              className="px-4 py-2 rounded-xl bg-[#102f38] text-white font-semibold hover:bg-[#102f38]/90 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Log Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Attendance Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daily attendance verification records, ward shift logs, and absence tracking.
          </p>
        </div>

        <button
          onClick={() => setRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Ward Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          description="Verified shift compliance"
          icon={CheckCircle2}
          variant="emerald"
        />
        <KpiCard
          title="Total Shift Logs"
          value={totalRecords}
          description="Recorded ward attendances"
          icon={Clock}
          variant="default"
        />
        <KpiCard
          title="Unexcused Absences"
          value={absenceCount}
          description="Flagged shift absences"
          icon={XCircle}
          variant={absenceCount > 0 ? 'amber' : 'default'}
        />
      </div>

      <DataTable
        columns={columns}
        data={attendance}
        loading={loading}
        searchPlaceholder="Search attendance by student name..."
        emptyTitle="No attendance records found"
      />
    </div>
  );
};

