import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, CheckCircle2, Award } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { AdminSummary } from '../../types/admin.types';
import { KpiCard } from '../../components/ui/KpiCard';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getSummary()
      .then((s) => setSummary(s))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Executive Reports & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Performance metrics, application throughput, student placement completion, and institutional partnerships.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Conversion Rate"
          value="92.4%"
          icon={TrendingUp}
          description="Approved from total verified"
          variant="emerald"
          loading={loading}
        />
        <KpiCard
          title="Active Capacity"
          value={`${summary?.activeApplications ?? 0} Students`}
          icon={Users}
          description="In active hospital rotations"
          variant="default"
          loading={loading}
        />
        <KpiCard
          title="Completion Ratio"
          value="98.1%"
          icon={Award}
          description="Graduated with certificates"
          variant="accent"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathway Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Applicant Pathway Breakdown
          </h3>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Partner University Pathways</span>
                <span className="font-mono">65%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#102f38] h-2 rounded-full w-[65%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Direct Independent Medical Students</span>
                <span className="font-mono">25%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#e26342] h-2 rounded-full w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Host Organization Direct Programs</span>
                <span className="font-mono">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full w-[10%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Rotations Capacity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Top Rotation Specialties
          </h3>
          <div className="space-y-3 pt-2">
            {[
              { label: 'General Surgery & Trauma', count: '38 Active' },
              { label: 'Internal Medicine & Cardiology', count: '32 Active' },
              { label: 'Pediatrics & Child Health', count: '24 Active' },
              { label: 'Obstetrics & Gynaecology', count: '19 Active' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-medium text-slate-800">{s.label}</span>
                <span className="font-mono font-bold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
