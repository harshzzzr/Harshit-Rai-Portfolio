import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '../../src/components/Hero';
import { personalInfo } from '../../src/data/portfolioData';

describe('Hero Component', () => {
  it('renders Harshit Rai name and role', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(new RegExp(personalInfo.name, 'i'));
    expect(screen.getByText(personalInfo.role)).toBeInTheDocument();
  });

  it('renders call to action buttons with correct targets', () => {
    render(<Hero />);
    const projectsLink = screen.getByRole('link', { name: /View Projects/i });
    expect(projectsLink).toHaveAttribute('href', '#projects');

    const resumeLink = screen.getByRole('link', { name: /Download Resume/i });
    expect(resumeLink).toHaveAttribute('href', '/resume/resume.pdf');
    expect(resumeLink).toHaveAttribute('download', 'Harshit_Rai_Resume.pdf');
  });

  it('renders social profile links', () => {
    render(<Hero />);
    const ghLink = screen.getByTitle('GitHub Profile');
    expect(ghLink).toHaveAttribute('href', personalInfo.socials.github);

    const linkedinLink = screen.getByTitle('LinkedIn Profile');
    expect(linkedinLink).toHaveAttribute('href', personalInfo.socials.linkedin);
  });
});
