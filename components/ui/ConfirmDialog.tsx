'use client';
import { useState } from 'react';
import { Modal, ModalHeader } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' (red) for destructive actions, 'primary' (orange) for neutral confirmations. */
  tone?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

/**
 * The single shared "are you sure?" surface — centered, dimmed, on top of
 * everything (Apple-style), instead of each table improvising its own inline
 * two-button swap. Used by Keys/Nodes/Users for revoke/expire/delete.
 */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', onConfirm, onClose }: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    setPending(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (e: any) {
      // Previously a failed onConfirm() (e.g. a server action throwing) just
      // silently reset the button with zero feedback — the dialog looked
      // like it did nothing, with no clue why.
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={pending ? () => {} : handleClose} maxWidth={380} labelledBy="confirm-dialog-title">
      <ModalHeader id="confirm-dialog-title" title={title} onClose={handleClose} />
      <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{description}</div>
      {error && (
        <p className="text-[12px] px-3 py-2 rounded-[8px]" style={{ color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</p>
      )}
      <div className="flex gap-2">
        <Button variant="ghost" onClick={handleClose} disabled={pending} className="flex-1 justify-center">{cancelLabel}</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} disabled={pending} className="flex-1 justify-center">
          {pending ? '…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
