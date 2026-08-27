import React, { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api/client';
import ApplicationWizard from './pages/ApplicationWizard';
import StudentProfile from './pages/StudentProfile';

// Providers & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { AdminLayout } from './components/layout/AdminLayout';

// Admin Pages
import { DashboardPage } from './pages/admin/DashboardPage';
import { ApplicationsPage } from './pages/admin/ApplicationsPage';
import { ApplicationDetailPage } from './pages/admin/ApplicationDetailPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { StudentDetailPage } from './pages/admin/StudentDetailPage';
import { UniversitiesPage } from './pages/admin/UniversitiesPage';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';
import { SupervisorsPage } from './pages/admin/SupervisorsPage';
import { ProgrammesPage } from './pages/admin/ProgrammesPage';
import { SpecialtiesPage } from './pages/admin/SpecialtiesPage';
import { PlacementsPage } from './pages/admin/PlacementsPage';
import { ClinicalAttachmentsPage } from './pages/admin/ClinicalAttachmentsPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { LogbooksPage } from './pages/admin/LogbooksPage';
import { EvaluationsPage } from './pages/admin/EvaluationsPage';
import { CertificatesPage } from './pages/admin/CertificatesPage';
import { CertificateVerificationPage } from './pages/admin/CertificateVerificationPage';
import { DocumentsPage } from './pages/admin/DocumentsPage';
import { DocumentVerificationPage } from './pages/admin/DocumentVerificationPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { MessagesPage } from './pages/admin/MessagesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { ExportsPage } from './pages/admin/ExportsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { RolesPermissionsPage } from './pages/admin/RolesPermissionsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { Forbidden403Page } from './pages/admin/Forbidden403Page';
import { NotFound404Page } from './pages/admin/NotFound404Page';

const rolePaths: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  AZAAM_STAFF: '/admin/dashboard',
  UNIVERSITY_USER: '/university/dashboard',
  ORGANIZATION_USER: '/organization/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  STUDENT: '/student/dashboard',
};

function Mark() {
  return <span className="logo-mark" aria-hidden="true">A</span>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" onClick={close} aria-label="AZAAM home">
        <Mark />
        <span className="brand-copy">
          <strong>AZAAM</strong>
          <small>International Medics Network</small>
        </span>
      </NavLink>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span /><span /><span />
      </button>
      <div className={`header-menu ${open ? 'is-open' : ''}`}>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/clinical-attachments" onClick={close}>Clinical Attachments</NavLink>
          <NavLink to="/how-it-works" onClick={close}>How it works</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>
        </nav>
        <div className="header-actions">
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink
                className="login-link font-semibold text-slate-800 hover:text-[#e26342]"
                to={user.roles.includes('SUPER_ADMIN') || user.roles.includes('AZAAM_STAFF') ? '/admin/dashboard' : '/student/dashboard'}
                onClick={close}
              >
                Workspace
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  close();
                }}
                className="button button-small secondary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <NavLink className="login-link" to="/login" onClick={close}>Sign in</NavLink>
              <NavLink className="button button-small" to="/apply" onClick={close}>Start application</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Arrow() { return <span aria-hidden="true">↗</span>; }
function Check() { return <span className="check" aria-hidden="true">✓</span>; }

function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> Clinical training, connected</div>
            <h1>Build your clinical future with <em>confidence.</em></h1>
            <p className="hero-lead">AZAAM connects medical students with structured clinical attachment opportunities, trusted institutions, and supervised learning pathways.</p>
            <div className="hero-actions">
              <NavLink className="button button-large" to="/apply">Find your pathway <Arrow /></NavLink>
              <NavLink className="button button-ghost" to="/how-it-works">See how it works <span aria-hidden="true">↓</span></NavLink>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars" aria-hidden="true"><span>AM</span><span>MK</span><span>HS</span><span>+</span></div>
              <div><strong>One focused platform</strong><span>for students & institutions</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-label="AZAAM clinical training journey">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-card visual-main">
              <div className="visual-card-top"><span className="status-dot" /> Your clinical journey</div>
              <div className="journey-line">
                <div className="journey-step done"><span><Check /></span><div><strong>Profile created</strong><small>Ready for review</small></div></div>
                <div className="journey-step active"><span>02</span><div><strong>Application review</strong><small>Being reviewed by AZAAM</small></div></div>
                <div className="journey-step"><span>03</span><div><strong>Clinical placement</strong><small>Find the right environment</small></div></div>
              </div>
              <div className="visual-progress"><span>Application progress</span><strong>68%</strong><div><i /></div></div>
            </div>
            <div className="floating-card floating-trust"><span className="floating-icon">✓</span><div><strong>Structured</strong><small>Verified workflow</small></div></div>
            <div className="floating-card floating-global"><span className="floating-icon">◎</span><div><strong>Connected</strong><small>Across institutions</small></div></div>
          </div>
        </section>

        <section className="trust-section">
          <p>Designed for the people who make clinical training possible</p>
          <div className="trust-items"><span>MEDICAL STUDENTS</span><span>UNIVERSITIES</span><span>HOST ORGANIZATIONS</span><span>CLINICAL SUPERVISORS</span></div>
        </section>

        <section className="pathways section-pad">
          <div className="section-heading centered">
            <div className="eyebrow">One platform. Clear pathways.</div>
            <h2>Everything you need to move<br className="desktop-break" /> from ambition to experience.</h2>
            <p>A simple digital workflow that keeps applications, documentation, placement and progress connected.</p>
          </div>
          <div className="pathway-grid">
            <NavLink className="pathway-card pathway-student" to="/for-students">
              <div className="card-icon">01</div><span className="card-label">For students</span><h3>Your next clinical experience starts here.</h3><p>Create your profile, apply for an attachment, submit documents and track every step.</p><span className="card-link">Explore the student pathway <Arrow /></span>
            </NavLink>
            <NavLink className="pathway-card pathway-institution" to="/for-universities">
              <div className="card-icon">02</div><span className="card-label">For institutions</span><h3>Turn collaboration into a structured pathway.</h3><p>Coordinate students, placements and clinical training through one connected workflow.</p><span className="card-link">Explore institution pathway <Arrow /></span>
            </NavLink>
            <NavLink className="pathway-card pathway-host" to="/for-organizations">
              <div className="card-icon">03</div><span className="card-label">For host organizations</span><h3>Make supervised training easier to manage.</h3><p>Support clinical attachments with clear records, supervision, evaluation and outcomes.</p><span className="card-link">Explore host pathway <Arrow /></span>
            </NavLink>
          </div>
        </section>

        <section className="process-section section-pad">
          <div className="process-copy">
            <div className="eyebrow">How AZAAM works</div>
            <h2>A clearer journey.<br /><em>Less uncertainty.</em></h2>
            <p>From your first profile to the completion of your clinical attachment, AZAAM keeps the journey visible and organized.</p>
            <NavLink className="text-arrow" to="/how-it-works">Explore the full process <Arrow /></NavLink>
          </div>
          <div className="process-list">
            {['Discover your pathway', 'Build a complete profile', 'Apply and submit documents', 'Coordinate your clinical placement', 'Learn, evaluate and complete'].map((item, index) => (
              <div className="process-row" key={item}><span>0{index + 1}</span><strong>{item}</strong><Arrow /></div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-pattern" aria-hidden="true" />
          <div className="cta-content">
            <div className="eyebrow light">Your next step</div>
            <h2>Ready to start your<br /><em>clinical journey?</em></h2>
            <p>Choose your pathway and let AZAAM guide the rest.</p>
            <NavLink className="button button-light button-large" to="/apply">Start your application <Arrow /></NavLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <NavLink className="brand footer-brand" to="/"><Mark /><span className="brand-copy"><strong>AZAAM</strong><small>International Medics Network</small></span></NavLink>
        <p>A connected platform for clinical attachment and supervised medical training pathways.</p>
        <div className="footer-links">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/clinical-attachments">Clinical Attachments</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AZAAM International Medics Network</span>
        <span>Clinical training, connected.</span>
      </div>
    </footer>
  );
}

function PublicPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Header />
      <main className="content-page">
        <div className="eyebrow">AZAAM International Medics Network</div>
        <h1>{title}</h1>
        <p>{body}</p>
        <NavLink className="button" to="/apply">Start an application <Arrow /></NavLink>
      </main>
      <Footer />
    </>
  );
}

function Apply() {
  const options = [
    ['UNIVERSITY', 'University student', 'Applying through a university pathway'],
    ['ORGANIZATION', 'Organization pathway', 'Applying through an organization pathway'],
    ['INDEPENDENT', 'Independent applicant', 'Applying without university or organization affiliation'],
  ];
  return (
    <>
      <Header />
      <main className="content-page">
        <div className="eyebrow">Application entry point</div>
        <h1>Choose the pathway that fits you.</h1>
        <p>Start with the option that best describes your current academic or professional pathway.</p>
        <div className="choice-grid">
          {options.map(([value, title, description], index) => (
            <NavLink className="choice" key={value} to={`/register?source=${value}`}>
              <span className="choice-index">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="card-link">Continue <Arrow /></span>
            </NavLink>
          ))}
        </div>
      </main>
    </>
  );
}

function Register() {
  const query = new URLSearchParams(window.location.search);
  const source = query.get('source') ?? 'INDEPENDENT';
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', nationality: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await api.post('/auth/register', { ...form, accountType: 'STUDENT', source });
      await login(form.email, form.password);
      navigate('/student/dashboard');
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? 'Registration could not be completed.');
    }
  }

  return (
    <>
      <Header />
      <main className="content-page narrow">
        <div className="eyebrow">{source} applicant</div>
        <h1>Create your account.</h1>
        <p>Your initial account is short and focused. You can complete the full profile after registration.</p>
        <form onSubmit={submit} className="form-card">
          <label>Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Nationality<input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></label>
          <label>Password<input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {message && <p className="form-message">{message}</p>}
          <button className="button">Create student account</button>
        </form>
      </main>
    </>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('AZAAM_STAFF')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.roles.includes('STUDENT')) {
        navigate('/student/dashboard', { replace: true });
      } else if (user.roles.includes('UNIVERSITY_USER')) {
        navigate('/university/dashboard', { replace: true });
      } else if (user.roles.includes('ORGANIZATION_USER')) {
        navigate('/organization/dashboard', { replace: true });
      } else if (user.roles.includes('SUPERVISOR')) {
        navigate('/supervisor/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.roles.includes('SUPER_ADMIN') || loggedUser.roles.includes('AZAAM_STAFF')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.roles.includes('STUDENT')) {
        navigate('/student/dashboard', { replace: true });
      } else if (loggedUser.roles.includes('UNIVERSITY_USER')) {
        navigate('/university/dashboard', { replace: true });
      } else if (loggedUser.roles.includes('ORGANIZATION_USER')) {
        navigate('/organization/dashboard', { replace: true });
      } else if (loggedUser.roles.includes('SUPERVISOR')) {
        navigate('/supervisor/dashboard', { replace: true });
      } else {
        navigate(rolePaths[loggedUser.roles[0]] ?? '/', { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to sign in with those credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword!2026');
    setError('');
  };

  return (
    <>
      <Header />
      <main className="content-page narrow">
        <div className="eyebrow">Secure access</div>
        <h1>Welcome back.</h1>
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            One-click Demo Accounts:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
              onClick={() => fillDemo('admin.demo@azam.test')}
            >
              ⭐ Super Admin (Full Access)
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
              onClick={() => fillDemo('student.demo@azam.test')}
            >
              Student
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
              onClick={() => fillDemo('university.demo@azam.test')}
            >
              University Coordinator
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
              onClick={() => fillDemo('supervisor.demo@azam.test')}
            >
              Clinical Supervisor
            </button>
          </div>
        </div>
        <form onSubmit={submit} className="form-card">
          <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="form-message">{error}</p>}
          <button className="button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          <NavLink to="/register?source=INDEPENDENT">Create a student account <Arrow /></NavLink>
        </form>
      </main>
    </>
  );
}

function LegacyDashboard({ role }: { role: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const { logout } = useAuth();

  useEffect(() => {
    if (role === 'STUDENT') api.get('/applications').then(({ data }) => setApplications(data?.data?.items || data?.data || [])).catch(() => undefined);
    if (role === 'ADMIN') api.get('/dashboard/admin/summary').then(({ data }) => setSummary(data?.data || {})).catch(() => undefined);
  }, [role]);

  const stats =
    role === 'ADMIN'
      ? [
          ['Students', summary.students ?? 0],
          ['Universities', summary.universities ?? 0],
          ['Organizations', summary.organizations ?? 0],
          ['Pending applications', summary.pendingApplications ?? 0],
          ['Approved applications', summary.approvedApplications ?? 0],
          ['Active applications', summary.activeApplications ?? 0],
        ]
      : [
          ['Account', 'Active'],
          ['Applications', role === 'STUDENT' ? applications.length : 'Scoped'],
          ['Next step', role === 'STUDENT' && applications.length === 0 ? 'Apply now' : 'Review'],
        ];

  return (
    <>
      <nav className="app-nav">
        <NavLink className="brand" to="/">
          <Mark />
          <span className="brand-copy"><strong>AZAAM</strong><small>{role.replace('_', ' ')}</small></span>
        </NavLink>
        <button
          className="button secondary"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          Sign out
        </button>
      </nav>
      <main className="dashboard">
        <div className="eyebrow">Operational workspace</div>
        <h1>{role === 'STUDENT' ? 'Your attachment journey' : 'Your AZAAM dashboard'}</h1>
        <p className="lead">Your secure workspace for clinical training coordination.</p>
        <div className="stat-grid">
          {stats.map(([label, value]) => (
            <div className="stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {role === 'STUDENT' && (
          <div className="empty-state">
            <h2>Student profile</h2>
            <p>Keep your personal information ready for application review.</p>
            <NavLink className="button secondary" to="/student/profile">Complete profile</NavLink>
          </div>
        )}
        {role === 'STUDENT' && applications.length === 0 && (
          <div className="empty-state">
            <h2>Start your clinical attachment application</h2>
            <p>Tell us about your pathway, academic background, and preferred clinical experience.</p>
            <NavLink className="button" to="/student/applications/new">Apply now</NavLink>
          </div>
        )}
      </main>
    </>
  );
}

function ProtectedRoute({ role, children }: { role: string; children?: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-mono text-xs text-slate-500">Authenticating session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin access check
  if (role === 'ADMIN') {
    const hasAdminRole = user.roles.includes('SUPER_ADMIN') || user.roles.includes('AZAAM_STAFF');
    if (!hasAdminRole) {
      return <Navigate to="/admin/403" replace />;
    }
  }

  return children ? <>{children}</> : <LegacyDashboard role={role} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<PublicPage title="About AZAAM" body="AZAAM's organizational details and approved public information are TO BE CONFIRMED." />} />
          <Route path="/clinical-attachments" element={<PublicPage title="Clinical attachments" body="Explore clinical attachment opportunities and supervised training pathways. Programme details are TO BE CONFIRMED." />} />
          <Route path="/for-students" element={<PublicPage title="For students" body="A focused pathway for students to create a profile, apply, and track their clinical attachment journey." />} />
          <Route path="/for-universities" element={<PublicPage title="For universities" body="University collaboration details, requirements, and approved relationships are TO BE CONFIRMED." />} />
          <Route path="/for-organizations" element={<PublicPage title="For host organizations" body="Host organization requirements and verification information are TO BE CONFIRMED." />} />
          <Route path="/how-it-works" element={<PublicPage title="How it works" body="Discover, apply, verify, approve, place, supervise, track, evaluate, and certify." />} />
          <Route path="/contact" element={<PublicPage title="Contact AZAAM" body="Official contact information is TO BE CONFIRMED." />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT" />} />
          <Route path="/student/profile" element={<ProtectedRoute role="STUDENT"><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/applications/new" element={<ProtectedRoute role="STUDENT"><ApplicationWizard /></ProtectedRoute>} />

          {/* Partner & Supervisor Dashboards */}
          <Route path="/university/dashboard" element={<ProtectedRoute role="UNIVERSITY_USER" />} />
          <Route path="/organization/dashboard" element={<ProtectedRoute role="ORGANIZATION_USER" />} />
          <Route path="/supervisor/dashboard" element={<ProtectedRoute role="SUPERVISOR" />} />

          {/* Admin Shell Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="universities" element={<UniversitiesPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="supervisors" element={<SupervisorsPage />} />
            <Route path="programmes" element={<ProgrammesPage />} />
            <Route path="specialties" element={<SpecialtiesPage />} />
            <Route path="placements" element={<PlacementsPage />} />
            <Route path="attachments" element={<ClinicalAttachmentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="logbooks" element={<LogbooksPage />} />
            <Route path="evaluations" element={<EvaluationsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="certificates/verification" element={<CertificateVerificationPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/verification" element={<DocumentVerificationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="exports" element={<ExportsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="403" element={<Forbidden403Page />} />
            <Route path="*" element={<NotFound404Page />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
