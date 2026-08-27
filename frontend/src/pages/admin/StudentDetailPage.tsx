import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  School,
  Building2,
  FileText,
  CalendarCheck,
  Award,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { StudentItem } from '../../types/admin.types';
import { Badge } from '../../components/ui/Badge';
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorState } from '../../components/ui/ErrorState';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const loadStudent = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await adminService.getStudent(id);
      setStudent(data);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <LoadingCard lines={8} />
      </div>
    );
  }

  if (errorMsg || !student) {
    return <ErrorState message={errorMsg || 'Student not found'} onRetry={loadStudent} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/students')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students Directory
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#102f38] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {student.fullName ? student.fullName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{student.fullName}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-200 text-slate-700">
                  {student.source}
                </span>
                {student.profileCompleted ? (
                  <Badge variant="success">Profile Complete</Badge>
                ) : (
                  <Badge variant="warning">Incomplete</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>{student.user?.email || 'No email attached'}</span>
                <span>•</span>
                <span>{student.nationality || 'Nationality Unspecified'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Affiliation Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider font-mono">
              Contact Information
            </h3>
            <div className="bg-slate-50/70 p-4 rounded-xl space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-mono text-slate-800">{student.user?.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone</span>
                <span className="font-mono text-slate-800">{student.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Country of Residence</span>
                <span className="text-slate-800">{student.country?.name || student.nationality || '—'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider font-mono">
              Institutional Affiliation
            </h3>
            <div className="bg-slate-50/70 p-4 rounded-xl space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">University</span>
                <span className="font-semibold text-slate-900">{student.university?.name || 'Independent'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Degree Programme</span>
                <span className="text-slate-800">{student.programme?.name || 'Undergraduate Medicine'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Host Organization</span>
                <span className="text-slate-800">{student.organization?.name || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application History */}
        <div className="px-6 pb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Submitted Applications ({student.applications?.length || 0})
          </h3>

          {!student.applications || student.applications.length === 0 ? (
            <div className="p-4 bg-slate-50 text-slate-400 text-xs rounded-xl text-center">
              No applications submitted yet by this student.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {student.applications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{app.applicationNumber}</span>
                    <span className="text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={app.status === 'APPROVED' ? 'success' : 'warning'}>
                      {app.status}
                    </Badge>
                    <NavLink
                      to={`/admin/applications/${app.id}`}
                      className="text-[#102f38] hover:underline font-semibold"
                    >
                      Open File →
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
