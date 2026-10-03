import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';

function ThemeTester() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('provides default theme and applies class to document element', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('current-theme');
    expect(themeSpan.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme between dark and light when toggleTheme is called', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    const themeSpan = screen.getByTestId('current-theme');

    expect(themeSpan.textContent).toBe('dark');

    fireEvent.click(toggleBtn);
    expect(themeSpan.textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('harshit_portfolio_theme')).toBe('light');

    fireEvent.click(toggleBtn);
    expect(themeSpan.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('harshit_portfolio_theme')).toBe('dark');
  });
});
