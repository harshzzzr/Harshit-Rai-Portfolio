import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPlaceholder from './pages/AdminDashboardPlaceholder';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <MainLayout>
            <Routes>
              {/* Public Portfolio Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

              {/* Admin Authentication & Protected Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={<Navigate to="/admin" replace />}
              />

              {/* Fallback to Home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
