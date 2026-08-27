import React from 'react';
import { useToast, ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/90';
      case 'error':
        return 'border-rose-200 bg-rose-50/90';
      case 'warning':
        return 'border-amber-200 bg-amber-50/90';
      case 'info':
      default:
        return 'border-sky-200 bg-sky-50/90';
    }
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200 ${getBorder()}`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-xs font-bold text-slate-900 mb-0.5">{toast.title}</h4>}
        <p className="text-xs text-slate-700 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
