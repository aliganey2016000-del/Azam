import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, Globe, Mail } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    academicYear: '2025/2026',
    autoNotifyUniversities: true,
    requireTwoStepTriage: true,
    maxPlacementDurationWeeks: '12',
    adminNotificationEmail: 'admin@azam.medics.network',
    certificatePrefix: 'AZ-2026',
  });
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('System settings saved successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System & Organization Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure clinical attachment rules, certificate generation prefixes, and automated notification triggers.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {/* Academic term configuration */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#102f38]" />
            Academic Term & Rotation Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Academic Term</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Rotation Duration (Weeks)</label>
              <input
                type="number"
                value={settings.maxPlacementDurationWeeks}
                onChange={(e) => setSettings({ ...settings, maxPlacementDurationWeeks: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
              />
            </div>
          </div>
        </div>

        {/* Certificate Prefixes */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#e26342]" />
            Certificate & Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Certificate Alphanumeric Prefix</label>
              <input
                type="text"
                value={settings.certificatePrefix}
                onChange={(e) => setSettings({ ...settings, certificatePrefix: e.target.value })}
                className="w-full px-3 py-2 font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Alert Email</label>
              <input
                type="email"
                value={settings.adminNotificationEmail}
                onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#102f38]/20 focus:border-[#102f38]"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            Automated Notification Triggers
          </h3>

          <label className="flex items-center gap-3 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={settings.autoNotifyUniversities}
              onChange={(e) => setSettings({ ...settings, autoNotifyUniversities: e.target.checked })}
              className="w-4 h-4 rounded text-[#102f38] focus:ring-[#102f38]"
            />
            <span className="text-slate-700 font-medium">
              Automatically notify partner university coordinators upon student application approval
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={settings.requireTwoStepTriage}
              onChange={(e) => setSettings({ ...settings, requireTwoStepTriage: e.target.checked })}
              className="w-4 h-4 rounded text-[#102f38] focus:ring-[#102f38]"
            />
            <span className="text-slate-700 font-medium">
              Require two-step document verification before clinical placement approval
            </span>
          </label>
        </div>

        {/* Save button */}
        <div className="p-6 bg-slate-50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#102f38] hover:bg-[#102f38]/90 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
