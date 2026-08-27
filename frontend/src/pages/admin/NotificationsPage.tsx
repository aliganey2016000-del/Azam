import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, Send, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { NotificationRecord } from '../../types/admin.types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getNotifications();
      setNotifications(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAll = async () => {
    try {
      await adminService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success('All notifications marked read.');
    } catch {
      error('Failed to mark notifications read.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications & System Alerts Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time administrative alerts, student application events, and system log triggers.
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/80 ${
                !notif.read ? 'bg-orange-50/20' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !notif.read ? 'bg-[#e26342] text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
