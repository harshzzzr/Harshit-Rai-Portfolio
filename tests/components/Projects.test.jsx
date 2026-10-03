import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Projects from '../../src/components/Projects';
import * as projectService from '../../src/services/projectService';

const mockProjects = [
  {
    id: 'campus-connect',
    title: 'Campus Connect',
    description: 'Full-stack campus networking platform with REST APIs',
    technologies: ['React', 'Node.js', 'MongoDB'],
    category: 'Web',
    featured: true,
    visible: true,
  },
  {
    id: 'drone-detection',
    title: 'Drone Detection System',
    description: 'Hardware telemetry and signal processing in C++',
    technologies: ['Arduino', 'C++', 'Python'],
    category: 'Hardware',
    featured: false,
    visible: true,
  },
  {
    id: 'android-utility',
    title: 'Android Compose Utility',
    description: 'Modern mobile application with offline persistence',
    technologies: ['Kotlin', 'Android', 'Java'],
    category: 'Mobile',
    featured: true,
    visible: true,
  },
];

describe('Projects Component — Search and Filtering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(projectService, 'getProjects').mockResolvedValue({
      data: mockProjects,
      error: null,
      isLive: true,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );

  it('renders all loaded projects by default', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
      expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
      expect(screen.getByText('Android Compose Utility')).toBeInTheDocument();
    });
  });

  it('filters projects by category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    });

    // Click Hardware category pill
    const hardwareButton = screen.getByRole('button', { name: /hardware/i });
    fireEvent.click(hardwareButton);

    expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
    expect(screen.queryByText('Campus Connect')).not.toBeInTheDocument();
    expect(screen.queryByText('Android Compose Utility')).not.toBeInTheDocument();
  });

  it('filters projects by featured status', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
    });

    const featuredToggle = screen.getByRole('button', { name: /featured only/i });
    fireEvent.click(featuredToggle);

    expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    expect(screen.getByText('Android Compose Utility')).toBeInTheDocument();
    expect(screen.queryByText('Drone Detection System')).not.toBeInTheDocument();
  });

  it('filters projects by technology selection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    });

    const techSelect = screen.getByLabelText(/filter by technology/i);
    fireEvent.change(techSelect, { target: { value: 'Python' } });

    expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
    expect(screen.queryByText('Campus Connect')).not.toBeInTheDocument();
    expect(screen.queryByText('Android Compose Utility')).not.toBeInTheDocument();
  });

  it('searches projects by query across title, description, and technologies', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search projects\.\.\./i);

    // Search by title
    fireEvent.change(searchInput, { target: { value: 'drone' } });
    expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
    expect(screen.queryByText('Campus Connect')).not.toBeInTheDocument();

    // Clear search with clear button
    const clearSearchBtn = screen.getByRole('button', { name: /clear search query/i });
    fireEvent.click(clearSearchBtn);
    expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
  });

  it('combines search and category filtering together seamlessly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    });

    // Select Web category
    const webButton = screen.getByRole('button', { name: /web/i });
    fireEvent.click(webButton);

    // Search for non-matching term in Web
    const searchInput = screen.getByPlaceholderText(/search projects\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Kotlin' } });

    expect(screen.queryByText('Campus Connect')).not.toBeInTheDocument();
    expect(screen.getByText('No Projects Found')).toBeInTheDocument();

    // Click Clear Filters
    const clearFiltersBtns = screen.getAllByRole('button', { name: /clear filters/i });
    fireEvent.click(clearFiltersBtns[0]);

    expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    expect(screen.getByText('Drone Detection System')).toBeInTheDocument();
    expect(screen.getByText('Android Compose Utility')).toBeInTheDocument();
  });

  it('shows appropriate empty states when no results match', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search projects\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'nonexistenttermxyz' } });

    expect(screen.getByText('No Projects Found')).toBeInTheDocument();
    expect(screen.getByText(/try another search/i)).toBeInTheDocument();
  });
});
