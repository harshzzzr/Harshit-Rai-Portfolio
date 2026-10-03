import React from 'react';
import ConfirmDialog from './ui/ConfirmDialog';
import { Trash2 } from 'lucide-react';

/**
 * DeleteConfirmModal
 * Backward-compatible wrapper delegating to the viewport-level ConfirmDialog.
 */
export default function DeleteConfirmModal({
  isOpen,
  title = 'Confirm Deletion',
  itemName = '',
  itemType = 'item',
  message,
  warningMessage,
  onConfirm,
  onCancel,
  onClose,
  loading = false,
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message || warningMessage || 'Are you sure you want to permanently delete this item? This action cannot be undone.'}
      itemName={itemName}
      confirmText={`Delete ${itemType}`}
      cancelText="Cancel"
      variant="danger"
      icon={Trash2}
      onConfirm={onConfirm}
      onCancel={onCancel || onClose}
      onClose={onClose || onCancel}
      loading={loading}
    />
  );
}
