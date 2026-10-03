import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((firstArg, secondArg = 'info', thirdArg = 4000) => {
    let type = 'info';
    let message = '';
    let duration = 4000;

    if (typeof firstArg === 'string') {
      message = firstArg;
      type = secondArg || 'info';
      duration = thirdArg ?? 4000;
    } else if (firstArg && typeof firstArg === 'object') {
      type = firstArg.type || 'info';
      message = firstArg.message || '';
      duration = firstArg.duration ?? 4000;
    }

    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newToast = { id, type, message, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 on screen

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  const toastIcons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const toastStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 dark:bg-red-950/90 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/90 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    info: 'bg-primary-50 dark:bg-primary-950/90 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800',
  };

  const toastContainer = typeof document !== 'undefined' && toasts.length > 0 && createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const IconComponent = toastIcons[toast.type] || Info;
        const style = toastStyles[toast.type] || toastStyles.info;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-200 animate-slide-down ${style}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <IconComponent size={18} className="shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-tight truncate">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastContainer}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (firstArg) => {
        const msg = typeof firstArg === 'string' ? firstArg : firstArg?.message;
        console.log('[Toast Notice]', msg);
      },
      removeToast: () => {},
    };
  }
  return context;
}
