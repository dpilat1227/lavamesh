'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  /** "sheet" docks to the bottom of the screen on mobile and centers on larger viewports. */
  align?: 'center' | 'sheet';
  closeOnBackdrop?: boolean;
  labelledBy?: string;
}

/**
 * The single shared modal implementation for the app. Portals to document.body,
 * traps focus, closes on Escape/backdrop click, locks body scroll, and restores
 * focus to the trigger element on close. Every modal in the app should use this
 * instead of a bespoke fixed-overlay div.
 */
export function Modal({ open, onClose, children, maxWidth = 480, align = 'center', closeOnBackdrop = true, labelledBy }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`animate-fade-in fixed inset-0 z-[9999] flex justify-center p-4 ${align === 'sheet' ? 'items-end sm:items-center' : 'items-center'}`}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', animationDuration: '0.15s' }}
      onClick={e => closeOnBackdrop && e.target === e.currentTarget && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="animate-scale-in w-full glass-strong rounded-[20px] p-6 space-y-5"
        style={{ maxWidth, outline: 'none', boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ModalHeader({ title, subtitle, onClose, id }: { title: string; subtitle?: string; onClose: () => void; id?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 id={id} className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h2>
        {subtitle && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="btn btn-ghost p-1.5 rounded-[8px]"
        style={{ border: 'none', color: 'var(--text-3)' }}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
