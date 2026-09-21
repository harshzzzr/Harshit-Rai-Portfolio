import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import GitHubSection from '../components/GitHubSection';
import LeetCodeSection from '../components/LeetCodeSection';
import Education from '../components/Education';
import Experience from '../components/Experience';
import SocialProfiles from '../components/SocialProfiles';
import SpotifySection from '../components/SpotifySection';
import Contact from '../components/Contact';
import SEO from '../components/SEO';

export default function HomePage() {
  return (
    <div className="w-full">
      <SEO
        title="Harshit Rai | Developer Portfolio"
        description="Personal portfolio of Harshit Rai — Computer Engineering student and developer specializing in full-stack web applications, C++, system architecture, and algorithmic problem solving."
        canonicalUrl="https://harshitrai.dev/"
        ogType="website"
      />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <GitHubSection />
      <LeetCodeSection />
      <Education />
      <Experience />
      <SocialProfiles />
      <SpotifySection />
      <Feedback />
      <Contact />
    </div>
  );
}
