import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import * as AuthContextModule from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderProtectedApp() {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <div>Admin Dashboard Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading indicator while auth is loading', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true,
    });

    renderProtectedApp();
    expect(screen.getByText(/Verifying admin credentials.../i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard Protected Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /admin/login', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    renderProtectedApp();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard Protected Content')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admin users to /admin/login', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    renderProtectedApp();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard Protected Content')).not.toBeInTheDocument();
  });

  it('renders protected content when user is authenticated admin', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
    });

    renderProtectedApp();
    expect(screen.getByText('Admin Dashboard Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
