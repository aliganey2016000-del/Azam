import React from 'react';
import { DownloadCloud, FileSpreadsheet, FileText, Database, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ExportsPage: React.FC = () => {
  const { success } = useToast();

  const handleExport = (dataset: string, format: string) => {
    success(`Generated and downloaded ${dataset} export in ${format} format.`);
  };

  const exportDatasets = [
    {
      title: 'Full Applications & Decisions Register',
      description: 'Comprehensive export of all submitted applications, triage notes, review timestamps, and statuses.',
      key: 'applications',
    },
    {
      title: 'Medical Students Directory',
      description: 'Complete student profiles including contact email, nationality, university, and profile status.',
      key: 'students',
    },
    {
      title: 'Attendance & Clinical Hours Audit',
      description: 'Daily ward attendance, time stamps, and supervisor verification status for accreditation audits.',
      key: 'attendance',
    },
    {
      title: 'Certificates & Verifications Master Ledger',
      description: 'Issued completion certificates, unique IDs, verification hashes, and issue dates.',
      key: 'certificates',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Data Exports & Institutional Backups
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate encrypted CSV and JSON data exports for institutional compliance, reporting, and accreditation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportDatasets.map((item) => (
          <div
            key={item.key}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#102f38] text-white flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleExport(item.title, 'CSV')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <DownloadCloud className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => handleExport(item.title, 'JSON')}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
