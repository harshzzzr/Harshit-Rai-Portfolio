import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * ConfirmDialog
 *
 * Viewport-level confirmation dialog rendered via React Portal into document.body.
 * Never trapped inside parent containers. Supports destructive, warning, and primary actions.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message,
  description,
  warningMessage,
  itemName = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon: CustomIcon,
  onConfirm,
  onCancel,
  onClose,
  loading = false,
}) {
  const [mounted, setMounted] = useState(false);
  const cancelBtnRef = useRef(null);

  const handleCancel = useCallback(() => {
    if (typeof onCancel === 'function') onCancel();
    else if (typeof onClose === 'function') onClose();
  }, [onCancel, onClose]);

  const displayMessage = description || message || warningMessage || 'Are you sure you want to proceed with this action?';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Body scroll lock & ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus cancel button by default for safety on destructive actions
    setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, handleCancel]);

  if (!mounted || !isOpen) return null;

  // Variant styling
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60',
      defaultIcon: AlertCircle,
      btnClass: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 shadow-sm',
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
      defaultIcon: AlertTriangle,
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500 shadow-sm',
    },
    primary: {
      iconBg: 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-900/60',
      defaultIcon: Info,
      btnClass: 'bg-primary-600 hover:bg-primary-700 text-white focus-visible:ring-primary-500 shadow-sm',
    },
  }[variant] || variantStyles.danger;

  const IconComponent = CustomIcon || variantStyles.defaultIcon;

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-up"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${variantStyles.iconBg}`}
          >
            <IconComponent size={22} />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p id="confirm-dialog-message" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {displayMessage}
            </p>
            {itemName && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono">
                  {itemName}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${variantStyles.btnClass}`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
