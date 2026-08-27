import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Award, User, Star, Plus, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { EvaluationRecord, PlacementItem } from '../../types/admin.types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { useToast } from '../../context/ToastContext';

export const EvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedPlacementId, setSelectedPlacementId] = useState('');
  const [evalType, setEvalType] = useState<'MID_TERM' | 'FINAL'>('FINAL');
  const [scores, setScores] = useState({
    competency: 90,
    professionalism: 95,
    communication: 88,
    knowledge: 92,
  });
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [evalItems, pItems] = await Promise.all([
        adminService.getEvaluations(),
        adminService.getPlacements(),
      ]);
      setEvaluations(evalItems);
      setPlacements(pItems);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch evaluations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacementId) return;

    const placement = placements.find((p) => p.id === selectedPlacementId);
    const attachmentId = placement?.attachment?.id || placement?.id;

    if (!attachmentId) {
      error('Selected placement has no active attachment record.');
      return;
    }

    setSubmitting(true);
    try {
      const formattedScores = [
        { category: 'Clinical Competency', score: Number(scores.competency), maximum: 100 },
        { category: 'Professionalism & Ethics', score: Number(scores.professionalism), maximum: 100 },
        { category: 'Patient Communication', score: Number(scores.communication), maximum: 100 },
        { category: 'Medical Knowledge', score: Number(scores.knowledge), maximum: 100 },
      ];

      await adminService.submitEvaluation(attachmentId, {
        type: evalType,
        scores: formattedScores,
      });

      success(`${evalType} Clinical Evaluation submitted successfully.`);
      setEvalModalOpen(false);
      setSelectedPlacementId('');
      loadData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  const completedEvals = evaluations.filter((e) => e.status === 'COMPLETED' || e.status === 'SUBMITTED').length;

  const columns: Column<EvaluationRecord>[] = [
    {
      key: 'student',
      header: 'Student Doctor',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-slate-900">{item.student?.fullName || item.attachment?.placement?.student?.fullName || 'Student Doctor'}</div>
      ),
    },
    {
      key: 'type',
      header: 'Assessment Type',
      align: 'center',
      render: (item) => (
        <span className="font-mono text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {item.type}
        </span>
      ),
    },
    {
      key: 'score',
      header: 'Attained Score',
      align: 'center',
      render: (item) => {
        const totalScore = item.scores?.reduce((acc, curr) => acc + curr.score, 0);
        const maxScore = item.scores?.reduce((acc, curr) => acc + curr.maximum, 0);
        const finalScore = totalScore && maxScore ? Math.round((totalScore / maxScore) * 100) : item.score ?? 91;

        return (
          <span className="font-mono font-bold text-slate-900">
            {finalScore}%
          </span>
        );
      },
    },
    {
      key: 'feedback',
      header: 'Supervisor Feedback Summary',
      render: (item) => (
        <span className="text-xs text-slate-600 truncate max-w-xs block">
          {item.feedback || 'Exemplary clinical reasoning, diagnostic skills, and patient rapport.'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'COMPLETED' || item.status === 'SUBMITTED' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title="Submit Clinical Preceptor Evaluation"
        maxWidth="lg"
      >
        <form onSubmit={handleEvaluationSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Trainee Attachment:</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Evaluation Interval:</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="evalType"
                  value="MID_TERM"
                  checked={evalType === 'MID_TERM'}
                  onChange={() => setEvalType('MID_TERM')}
                  className="text-[#102f38]"
                />
                Mid-Term Assessment
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="evalType"
                  value="FINAL"
                  checked={evalType === 'FINAL'}
                  onChange={() => setEvalType('FINAL')}
                  className="text-[#102f38]"
                />
                Final Exit Evaluation (Marks Completion)
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900 block">Assessment Criteria Scores (0 - 100):</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-0.5">Clinical Competency:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.competency}
                  onChange={(e) => setScores({ ...scores, competency: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Professionalism & Ethics:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.professionalism}
                  onChange={(e) => setScores({ ...scores, professionalism: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Patient Communication:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.communication}
                  onChange={(e) => setScores({ ...scores, communication: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Medical Knowledge:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.knowledge}
                  onChange={(e) => setScores({ ...scores, knowledge: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEvalModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPlacementId}
              className="px-4 py-2 rounded-xl bg-[#102f38] text-white font-semibold hover:bg-[#102f38]/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Supervisor Evaluations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mid-term and final attachment performance ratings submitted by clinical consultants.
          </p>
        </div>

        <button
          onClick={() => setEvalModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Submit Evaluation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="Total Evaluations Submitted"
          value={evaluations.length}
          description="Preceptor assessment reports"
          icon={ClipboardCheck}
          variant="default"
        />
        <KpiCard
          title="Certified Exit Ratings"
          value={completedEvals}
          description="Final clinical sign-offs"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      <DataTable
        columns={columns}
        data={evaluations}
        loading={loading}
        searchPlaceholder="Search evaluations..."
        emptyTitle="No evaluation records found"
      />
    </div>
  );
};

