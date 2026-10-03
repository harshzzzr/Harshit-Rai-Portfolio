import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminModal from '../../src/components/admin/ui/AdminModal';
import ConfirmDialog from '../../src/components/admin/ui/ConfirmDialog';
import { AdminToastProvider, useAdminToast } from '../../src/components/admin/ui/AdminToast';

describe('AdminModal Component', () => {
  it('renders modal dialog content when isOpen is true', () => {
    render(
      <AdminModal
        isOpen={true}
        onClose={() => {}}
        title="Edit Item"
        description="Provide details for this record"
      >
        <div data-testid="modal-child-content">Modal Inner Body</div>
      </AdminModal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    expect(screen.getByText('Provide details for this record')).toBeInTheDocument();
    expect(screen.getByTestId('modal-child-content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AdminModal isOpen={false} onClose={() => {}} title="Hidden Dialog">
        <div>Hidden Content</div>
      </AdminModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Dialog')).not.toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked without unsaved changes', () => {
    const handleClose = vi.fn();
    render(
      <AdminModal isOpen={true} onClose={handleClose} title="Dismissable Dialog">
        <div>Body</div>
      </AdminModal>
    );

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation prompt before closing if hasUnsavedChanges is true', () => {
    const handleClose = vi.fn();
    render(
      <AdminModal
        isOpen={true}
        onClose={handleClose}
        title="Unsaved Form"
        hasUnsavedChanges={true}
      >
        <div>Dirty input state</div>
      </AdminModal>
    );

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);

    // Should NOT call onClose immediately
    expect(handleClose).not.toHaveBeenCalled();

    // Confirm prompt should appear
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText('Your changes have not been saved.')).toBeInTheDocument();

    // Clicking "Discard" confirms
    const discardBtn = screen.getByRole('button', { name: /^discard$/i });
    fireEvent.click(discardBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog Component', () => {
  it('renders title, description and action buttons', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Record"
        description="Are you sure you want to delete this record?"
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Record')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this record?')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Deleting Item"
        description="Please wait..."
        confirmText="Confirm Delete"
        loading={true}
        onConfirm={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});

describe('AdminToast System', () => {
  function ToastTester() {
    const { showToast } = useAdminToast();
    return (
      <div>
        <button onClick={() => showToast('Operation successful!', 'success')}>
          Trigger Success Toast
        </button>
      </div>
    );
  }

  it('renders and displays toast notifications', () => {
    render(
      <AdminToastProvider>
        <ToastTester />
      </AdminToastProvider>
    );

    const triggerBtn = screen.getByRole('button', { name: /trigger success toast/i });
    fireEvent.click(triggerBtn);

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
  });
});
