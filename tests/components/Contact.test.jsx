import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contact from '../../src/components/Contact';
import { ToastProvider } from '../../src/context/ToastContext';
import { SITE_CONFIG } from '../../src/config/site';

describe('Contact Component & Copy Email Action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <Contact />
      </ToastProvider>
    );

  it('renders contact information and direct email', () => {
    renderComponent();

    expect(screen.getByText('Direct Email')).toBeInTheDocument();
    expect(screen.getByText(SITE_CONFIG.email)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy email/i })).toBeInTheDocument();
  });

  it('copies email to clipboard on click and displays confirmation', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderComponent();

    const copyBtn = screen.getByRole('button', { name: /copy email/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(SITE_CONFIG.email);
      expect(screen.getAllByText(/email copied/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles clipboard failure gracefully with fallback notice', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderComponent();

    const copyBtn = screen.getByRole('button', { name: /copy email/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText(/unable to copy email/i)).toBeInTheDocument();
    });
  });

  it('validates contact form required fields', async () => {
    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Full name is required.')).toBeInTheDocument();
      expect(screen.getByText('Email address is required.')).toBeInTheDocument();
      expect(screen.getByText('Subject is required.')).toBeInTheDocument();
      expect(screen.getByText('Message content is required.')).toBeInTheDocument();
    });
  });
});
