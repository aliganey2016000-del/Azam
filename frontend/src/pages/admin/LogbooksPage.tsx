import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, Eye, Activity, Check, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { LogbookRecord } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const LogbooksPage: React.FC = () => {
  const [logbooks, setLogbooks] = useState<LogbookRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookRecord | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getLogbooks();
      setLogbooks(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch logbook entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewAction = async (status: 'APPROVED' | 'REVISION_REQUESTED') => {
    if (!selectedLogbook) return;
    setSubmitting(true);
    try {
      await adminService.reviewLogbookEntry(selectedLogbook.id, {
        status,
        comment: reviewComment,
      });
      success(`Logbook entry marked as ${status}.`);
      setReviewModalOpen(false);
      setSelectedLogbook(null);
      setReviewComment('');
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update logbook status.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<LogbookRecord>[] = [
    {
      key: 'student',
      header: 'Student Doctor',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-slate-900">{item.student?.fullName || item.attachment?.placement?.student?.fullName || 'Student Doctor'}</div>
      ),
    },
    {
      key: 'clinicalArea',
      header: 'Clinical Specialty Area',
      render: (item) => (
        <span className="font-medium text-slate-800">{item.clinicalArea || 'General Surgery / Medicine'}</span>
      ),
    },
    {
      key: 'procedure',
      header: 'Observed / Performed Procedure',
      render: (item) => (
        <div className="text-xs text-slate-700 max-w-sm truncate">
          {item.content?.procedure || item.content?.activity || 'Clinical Case & Patient History Taking'}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Entry Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Verification',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'APPROVED' || item.status === 'VERIFIED' ? 'success' : item.status === 'REVISION_REQUESTED' ? 'danger' : 'warning'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Preceptor Review',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLogbook(item);
            setReviewComment(item.supervisorComment || '');
            setReviewModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          Review Logbook
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedLogbook(null);
        }}
        title="Clinical Logbook Preceptor Verification"
        maxWidth="lg"
      >
        {selectedLogbook && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono uppercase text-[10px]">Specialty Area</span>
                <span className="font-semibold text-slate-800">{selectedLogbook.clinicalArea || 'Internal Medicine'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono uppercase text-[10px]">Procedure Recorded</span>
                <span className="font-medium text-slate-900">{selectedLogbook.content?.procedure || 'Abdominal Ultrasound Assist'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">Trainee Clinical Notes:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-sans">
                  {selectedLogbook.content?.notes || 'Patient presented with acute clinical symptoms. Assisted consultant with patient examination, baseline vitals check, and clinical documentation.'}
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preceptor Feedback & Verification Remarks:</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="e.g. Excellent clinical technique demonstrated under direct supervision..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReviewAction('REVISION_REQUESTED')}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 flex items-center gap-1 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Request Revisions
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReviewAction('APPROVED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Approve & Sign Logbook
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Digital Clinical Logbooks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review procedures recorded by medical students and verified by designated hospital preceptors.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logbooks}
        loading={loading}
        searchPlaceholder="Search logbook entries..."
        emptyTitle="No logbook records entered"
      />
    </div>
  );
};

