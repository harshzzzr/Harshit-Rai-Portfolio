import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import GitHubSection from '../components/GitHubSection';
import Education from '../components/Education';
import Experience from '../components/Experience';
import SocialProfiles from '../components/SocialProfiles';
import Feedback from '../components/Feedback';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <div className="w-full">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <GitHubSection />
      <Education />
      <Experience />
      <SocialProfiles />
      <Feedback />
      <Contact />
    </div>
  );
}
