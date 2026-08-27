import React, { useEffect, useState } from 'react';
import { Shield, Key, CheckCircle2, Lock } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Badge } from '../../components/ui/Badge';

export const RolesPermissionsPage: React.FC = () => {
  const [data, setData] = useState<{ roles: any[]; permissions: any[] }>({ roles: [], permissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getRolesPermissions()
      .then((res) => setData(res))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Role-Based Access Control (RBAC) Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Strict permission policies governing administrative and clinical data access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#102f38]" />
            Defined Roles
          </h3>

          <div className="space-y-2.5">
            {data.roles.map((r) => (
              <div
                key={r.id || r.name}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs font-mono">{r.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.description || 'System access role'}
                  </div>
                </div>
                <Badge variant="default">
                  {r.permissions?.length || 0} permissions
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Key className="w-4 h-4 text-[#e26342]" />
            System Permissions Catalog ({data.permissions.length})
          </h3>

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {data.permissions.map((p) => (
              <div
                key={p.id || p.key}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs"
              >
                <div className="font-mono font-bold text-slate-800">{p.key}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{p.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
