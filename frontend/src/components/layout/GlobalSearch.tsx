import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, FileText, User, Building2, Award, Calendar, X, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/admin.service';

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    applications: any[];
    universities: any[];
    organizations: any[];
    placements: any[];
  }>({
    students: [],
    applications: [],
    universities: [],
    organizations: [],
    placements: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], applications: [], universities: [], organizations: [], placements: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await adminService.globalSearch(query);
        setResults(res);
      } catch {
        // graceful handle
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults =
    results.students.length +
    results.applications.length +
    results.universities.length +
    results.organizations.length +
    results.placements.length;

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      {/* Search trigger button in header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 rounded-lg text-xs text-slate-500 hover:text-slate-800 transition-all max-w-[240px] w-full"
      >
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="truncate">Search AZAAM...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded shadow-2xs text-slate-400">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, applications, institutions, placements..."
                className="w-full text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results body */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-400">Searching records...</div>
              ) : !query.trim() ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Type a name, application number, or institution keyword...
                </div>
              ) : totalResults === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No records matching <strong className="font-semibold text-slate-700">"{query}"</strong>
                </div>
              ) : (
                <div className="space-y-3 p-1">
                  {/* Applications */}
                  {results.applications.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                        Applications ({results.applications.length})
                      </div>
                      <div className="space-y-0.5">
                        {results.applications.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleSelect(`/admin/applications/${app.id}`)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors group text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-[#e26342]" />
                              <div>
                                <span className="font-semibold text-slate-900">{app.applicationNumber}</span>
                                <span className="text-slate-500 ml-2 font-normal">
                                  {app.student?.fullName || 'Applicant'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {app.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Students */}
                  {results.students.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                        Students ({results.students.length})
                      </div>
                      <div className="space-y-0.5">
                        {results.students.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => handleSelect(`/admin/students/${student.id}`)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-[#102f38]" />
                              <div>
                                <span className="font-semibold text-slate-900">{student.fullName}</span>
                                <span className="text-slate-500 ml-2 font-normal">
                                  {student.nationality || student.source}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Universities & Organizations */}
                  {(results.universities.length > 0 || results.organizations.length > 0) && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                        Institutions
                      </div>
                      <div className="space-y-0.5">
                        {results.universities.map((uni) => (
                          <button
                            key={uni.id}
                            onClick={() => handleSelect('/admin/universities')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className="w-4 h-4 text-sky-600" />
                              <span className="font-semibold text-slate-900">{uni.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">University</span>
                          </button>
                        ))}
                        {results.organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => handleSelect('/admin/organizations')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-semibold text-slate-900">{org.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Host Org</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick jump to admin resource</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
