import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

/**
 * AdminModal
 *
 * Viewport-level dialog rendered via React Portal into document.body.
 * Features:
 * - Proper z-index layering (z-50) above sidebar, table, and transformed parents
 * - Fixed header and footer with internal scrollable body (max-h-[90vh])
 * - Body scroll lock on open, restored cleanly on close
 * - ESC key and backdrop click detection with unsaved changes guard
 * - Accessible ARIA attributes and focus management
 */
export default function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'medium',
  hasUnsavedChanges = false,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
}) {
  const [mounted, setMounted] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Mount check for safe portal rendering in SSR/hydration environments
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Move initial focus into modal
    const focusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      setTimeout(() => focusable.focus(), 50);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Request close with dirty form guard
  const requestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Escape key listener & Tab focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showUnsavedPrompt) {
          setShowUnsavedPrompt(false);
        } else if (closeOnEsc) {
          requestClose();
        }
      }

      // Trap Tab within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showUnsavedPrompt, closeOnEsc, requestClose]);

  if (!mounted || !isOpen) return null;

  // Sizing definitions
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    'extra-large': 'max-w-5xl',
  }[size] || 'max-w-lg';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
          requestClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        aria-describedby={description ? 'admin-modal-description' : undefined}
        className={`relative w-full ${sizeClasses} max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-2xl bg-white/95 dark:bg-[#141516]/95 border border-neutral-300/80 dark:border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden focus:outline-none`}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 dark:border-white/10 bg-white/95 dark:bg-[#141516]/95 z-10">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/[0.04] text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-white/10">
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              <h2
                id="admin-modal-title"
                className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate tracking-tight"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="admin-modal-description"
                  className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={requestClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 text-neutral-800 dark:text-[#D7E2EA]">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="shrink-0 px-5 py-3.5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-neutral-50/90 dark:bg-[#101112]/95 z-10 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}

        {/* Unsaved Changes Confirmation Dialog Overlay */}
        {showUnsavedPrompt && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
            role="alertdialog"
            aria-labelledby="unsaved-prompt-title"
          >
            <div className="bg-white dark:bg-[#141516] rounded-2xl border border-neutral-300 dark:border-white/15 p-5 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-200 dark:border-amber-900">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 id="unsaved-prompt-title" className="text-sm font-bold text-neutral-900 dark:text-white">
                    Discard changes?
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Your changes have not been saved.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUnsavedPrompt(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedPrompt(false);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
