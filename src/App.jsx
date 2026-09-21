import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            {/* Fallback route back to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}
