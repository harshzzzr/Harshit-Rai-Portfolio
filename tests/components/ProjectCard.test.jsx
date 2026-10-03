import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '../../src/components/ProjectCard';

const mockProjectWithDemo = {
  id: 'drone-detection-system',
  title: 'Drone Detection System',
  description: 'Computer vision pipeline detecting unauthorized UAVs in real-time.',
  technologies: ['Python', 'YOLOv8', 'OpenCV'],
  featured: true,
  githubUrl: 'https://github.com/harshzzzr/drone-detection',
  liveUrl: 'https://drone-detection.example.com',
  badge: 'AI & Computer Vision',
  image: null,
};

const mockProjectWithoutDemo = {
  id: 'campus-connect',
  title: 'Campus Connect',
  description: 'Academic and student networking platform with real-time notifications.',
  technologies: ['React', 'Node.js', 'Firebase'],
  featured: false,
  githubUrl: 'https://github.com/harshzzzr/campus-connect',
  liveUrl: null,
  badge: 'Web App',
  image: null,
};

function renderProjectCard(project) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>
  );
}

describe('ProjectCard Component', () => {
  it('renders project title, description, and technologies', () => {
    renderProjectCard(mockProjectWithDemo);

    expect(screen.getByRole('heading', { name: 'Drone Detection System' })).toBeInTheDocument();
    expect(
      screen.getByText('Computer vision pipeline detecting unauthorized UAVs in real-time.')
    ).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('YOLOv8')).toBeInTheDocument();
    expect(screen.getByText('OpenCV')).toBeInTheDocument();
  });

  it('renders featured badge when featured is true', () => {
    renderProjectCard(mockProjectWithDemo);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not render featured badge when featured is false', () => {
    renderProjectCard(mockProjectWithoutDemo);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('renders live demo link only when liveUrl is present', () => {
    const { unmount } = renderProjectCard(mockProjectWithDemo);
    expect(screen.getByRole('link', { name: /Live demo/i })).toHaveAttribute(
      'href',
      'https://drone-detection.example.com'
    );

    unmount();

    renderProjectCard(mockProjectWithoutDemo);
    expect(screen.queryByRole('link', { name: /Live demo/i })).not.toBeInTheDocument();
  });

  it('links to the project detail page with correct id slug', () => {
    renderProjectCard(mockProjectWithDemo);
    const detailLinks = screen.getAllByRole('link', {
      name: /Drone Detection System|View details and architecture/i,
    });
    expect(detailLinks[0]).toHaveAttribute('href', '/projects/drone-detection-system');
  });
});
