import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Award, CheckCircle2, XCircle, ShieldCheck, QrCode } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { CertificateRecord } from '../../types/admin.types';

export const CertificateVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certNumber, setCertNumber] = useState(searchParams.get('number') || '');
  const [result, setResult] = useState<{
    searched: boolean;
    valid: boolean;
    certificate?: CertificateRecord;
    message?: string;
  }>({ searched: false, valid: false });
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!certNumber.trim()) return;
    setLoading(true);
    try {
      const res = await adminService.verifyCertificate(certNumber.trim());
      setResult({ searched: true, valid: res.valid, certificate: res.certificate, message: res.message });
    } catch {
      setResult({ searched: true, valid: false, message: 'Verification lookup failed.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const num = searchParams.get('number');
    if (num) {
      setCertNumber(num);
      handleVerify();
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Certificate Authenticity Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cryptographically verify the validity and authenticity of AZAAM clinical training certificates.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-semibold text-slate-700">
          Enter Alphanumeric Certificate Identification Code:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            placeholder="e.g. AZ-2026-00891"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !certNumber.trim()}
            className="px-5 py-2.5 bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result.searched && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {result.valid && result.certificate ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-lg overflow-hidden">
              <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">VERIFIED AUTHENTIC CERTIFICATE</h3>
                    <p className="text-[11px] text-emerald-100 font-mono">
                      AZAAM International Medics Network Registry
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Certificate No.</span>
                    <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {result.certificate.certificateNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Issue Date</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(result.certificate.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Recipient Doctor</span>
                    <p className="font-bold text-slate-900 text-base mt-0.5">
                      {result.certificate.recipientName || result.certificate.student?.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Clinical Programme</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {result.certificate.programmeName || 'Clinical Attachment & Supervised Training'} (
                      {result.certificate.specialtyName || 'General Surgery'})
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Accredited Institution</span>
                    <p className="text-slate-700 mt-0.5">
                      {result.certificate.institutionName || 'AZAAM Network Teaching Hospital'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-rose-400 shadow-md p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-rose-900">Certificate Not Found or Invalid</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {result.message ||
                  'No authentic record corresponds to this certificate code. Please check the alphanumeric code or contact AZAAM credentials committee.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
