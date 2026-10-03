import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsTracker from './components/AnalyticsTracker';
import ErrorBoundary from './components/ErrorBoundary';
import { AdminToastProvider } from './components/admin/ui/AdminToast';

// Route-level code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Lightweight accessible route transition fallback
 */
function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading experience...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnalyticsTracker />
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
              {/* Public Portfolio Routes */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <MainLayout>
                    <ProjectDetailPage />
                  </MainLayout>
                }
              />
              <Route
                path="/privacy"
                element={
                  <MainLayout>
                    <PrivacyPolicyPage />
                  </MainLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <MainLayout>
                    <TermsPage />
                  </MainLayout>
                }
              />

              {/* Admin Authentication & Console */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminToastProvider>
                      <AdminDashboardPage />
                    </AdminToastProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={<Navigate to="/admin" replace />}
              />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <MainLayout>
                    <NotFoundPage />
                  </MainLayout>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
