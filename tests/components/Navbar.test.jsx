import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';
import { ThemeProvider } from '../../src/context/ThemeContext';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the brand name with link to home', () => {
    renderNavbar();
    const brandLink = screen.getByLabelText(/Harshit Rai Portfolio Homepage/i);
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/#hero');
  });

  it('renders major navigation links', () => {
    renderNavbar();
    expect(screen.getByRole('navigation', { name: /Main Navigation/i })).toBeInTheDocument();
    expect(screen.getAllByText('Projects')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Experience')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Contact')[0]).toBeInTheDocument();
  });

  it('toggles theme when clicking the theme button', () => {
    renderNavbar();
    const themeButtons = screen.getAllByLabelText(/Switch to (light|dark) mode/i);
    expect(themeButtons.length).toBeGreaterThanOrEqual(1);

    const initialAria = themeButtons[0].getAttribute('aria-label');
    fireEvent.click(themeButtons[0]);

    const updatedButtons = screen.getAllByLabelText(/Switch to (light|dark) mode/i);
    expect(updatedButtons[0].getAttribute('aria-label')).not.toBe(initialAria);
  });

  it('toggles mobile menu on hamburger button click', () => {
    renderNavbar();
    const openMenuBtn = screen.getByLabelText(/Open navigation menu/i);
    expect(openMenuBtn).toBeInTheDocument();

    // Click to open
    fireEvent.click(openMenuBtn);
    expect(screen.getByLabelText(/Mobile Navigation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Close navigation menu/i)).toBeInTheDocument();
  });
});
