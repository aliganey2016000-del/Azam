import React from 'react';
import { Modal } from '../ui/Modal';
import { BookOpen, ShieldCheck, CheckCircle2, Award, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AZAAM Administrative Workflow Reference"
      subtitle="Operational lifecycle guidelines for staff & coordinators"
      maxWidth="xl"
    >
      <div className="space-y-6 text-slate-700 text-xs">
        {/* Intro */}
        <p className="leading-relaxed text-slate-600">
          The AZAAM International Medics Network Admin Portal provides operational control over clinical attachment pathways, student records, institutional partnerships, evaluations, and tamper-proof certificate issuance.
        </p>

        {/* 4-Step Lifecycle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-4 h-4 text-[#e26342]" />
              <span>1. Application & Triage</span>
            </div>
            <p className="text-slate-500 leading-normal">
              Review submitted medical student applications. Request missing documents, verify student status, and record approval decisions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#102f38]" />
              <span>2. Placement & Assignment</span>
            </div>
            <p className="text-slate-500 leading-normal">
              Pair approved students with accredited host hospitals, clinical departments, and designated senior supervisors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>3. Clinical Tracking</span>
            </div>
            <p className="text-slate-500 leading-normal">
              Monitor daily attendance records, procedures entered into digital logbooks, and mid-term / final supervisor evaluations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>4. Verification & Certification</span>
            </div>
            <p className="text-slate-500 leading-normal">
              Issue tamper-proof certificates with unique alphanumeric codes and instant QR/public verification endpoints.
            </p>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-0.5">Authorization Boundary Note</strong>
            <span>
              Frontend navigation elements adapt to assigned roles. However, all administrative data modifications are strictly verified by backend RBAC middlewares before persistence.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
