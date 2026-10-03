import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboardPage from '../../src/pages/AdminDashboardPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { ToastProvider } from '../../src/context/ToastContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import AdminErrorBoundary from '../../src/components/admin/ui/AdminErrorBoundary';

// Mock Services
vi.mock('../../src/services/projectService', () => ({
  getProjects: vi.fn().mockResolvedValue({
    data: [
      { id: 'proj-1', title: 'Test Project 1', technologies: ['React'], featured: true },
      { id: 'proj-2', title: 'Test Project 2', technologies: ['Node.js'], featured: false },
    ],
  }),
  deleteProject: vi.fn().mockResolvedValue({ success: true }),
  toggleProjectFeatured: vi.fn().mockResolvedValue({ success: true }),
  toggleProjectVisibility: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../src/services/skillService', () => ({
  getSkills: vi.fn().mockResolvedValue({
    data: [{ category: 'Programming', skills: [{ name: 'C++' }] }],
    rawList: [{ id: 'skill-1', name: 'C++', category: 'Programming', visible: true }],
  }),
}));

vi.mock('../../src/services/timelineService', () => ({
  getEducation: vi.fn().mockResolvedValue({
    data: [{ id: 'edu-1', degree: 'Computer Engineering', institution: 'University', visible: true }],
    rawList: [{ id: 'edu-1', degree: 'Computer Engineering', institution: 'University', visible: true }],
  }),
  getTimelineData: vi.fn().mockResolvedValue({
    data: {
      experience: [{ id: 'exp-1', title: 'Intern', type: 'experience' }],
      hackathons: [],
      research: [],
      achievements: [],
      certifications: [],
    },
    rawList: [{ id: 'exp-1', title: 'Intern', type: 'experience', visible: true }],
  }),
}));

vi.mock('../../src/services/messageService', () => ({
  getMessageCount: vi.fn().mockResolvedValue(3),
  getMessages: vi.fn().mockResolvedValue({
    data: [{ id: 'msg-1', name: 'John Doe', email: 'john@example.com', subject: 'Inquiry', message: 'Hi', status: 'unread' }],
  }),
}));

vi.mock('../../src/services/feedbackService', () => ({
  getAllFeedback: vi.fn().mockResolvedValue({
    data: [{ id: 'fb-1', name: 'Alice', role: 'Engineer', message: 'Great portfolio!', status: 'pending', featured: false }],
  }),
}));

vi.mock('../../src/services/analyticsService', () => ({
  getAnalyticsSummary: vi.fn().mockResolvedValue({
    totalPageViews: 120,
    uniqueSessions: 35,
    topProjects: [],
    dailyPageViews: [],
  }),
}));

function renderAdmin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AdminDashboardPage />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('AdminDashboardPage & Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard overview without crashing', async () => {
    renderAdmin();

    expect(screen.getByRole('heading', { name: /portfolio overview/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Cataloged Projects (2)')).toBeInTheDocument();
    });
  });

  it('switches to projects tab smoothly without triggering infinite loops', async () => {
    renderAdmin();

    const projectsTabBtn = screen.getByRole('button', { name: /projects/i });
    fireEvent.click(projectsTabBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /projects management/i })).toBeInTheDocument();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  it('switches across all main management tabs without depth errors', async () => {
    renderAdmin();

    // 1. Skills
    fireEvent.click(screen.getByRole('button', { name: /skills/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /skills management/i })).toBeInTheDocument();
    });

    // 2. Education
    fireEvent.click(screen.getByRole('button', { name: /education/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /education management/i })).toBeInTheDocument();
    });

    // 3. Messages
    fireEvent.click(screen.getByRole('button', { name: /messages/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /messages management/i })).toBeInTheDocument();
    });

    // 4. Feedback
    fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /feedback management/i })).toBeInTheDocument();
    });
  });
});

describe('AdminErrorBoundary Component', () => {
  function BuggyChild({ shouldThrow }) {
    if (shouldThrow) {
      throw new Error('Critical test simulation error');
    }
    return <div>Normal Content</div>;
  }

  it('catches render errors and provides recovery actions', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handleResetTab = vi.fn();

    render(
      <AdminErrorBoundary onResetTab={handleResetTab}>
        <BuggyChild shouldThrow={true} />
      </AdminErrorBoundary>
    );

    expect(screen.getByText('Unable to display this admin section')).toBeInTheDocument();
    expect(screen.getByText('Critical test simulation error')).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /return to overview/i });
    fireEvent.click(returnBtn);
    expect(handleResetTab).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
