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
import Feedback from '../components/Feedback';
import Contact from '../components/Contact';
import SEO from '../components/SEO';
import { SITE_CONFIG } from '../config/site';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`,
      'url': SITE_CONFIG.url,
      'name': 'Harshit Rai',
      'description': SITE_CONFIG.description,
      'publisher': {
        '@id': `${SITE_CONFIG.url}#person`
      },
      'inLanguage': 'en-US'
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_CONFIG.url}#profilepage`,
      'url': SITE_CONFIG.url,
      'name': SITE_CONFIG.title,
      'isPartOf': {
        '@id': `${SITE_CONFIG.url}#website`
      },
      'mainEntity': {
        '@id': `${SITE_CONFIG.url}#person`
      }
    },
    {
      '@type': 'Person',
      '@id': `${SITE_CONFIG.url}#person`,
      'name': SITE_CONFIG.name,
      'url': SITE_CONFIG.url,
      'image': SITE_CONFIG.ogImage,
      'description': SITE_CONFIG.description,
      'jobTitle': SITE_CONFIG.role,
      'sameAs': [
        SITE_CONFIG.links.github,
        SITE_CONFIG.links.linkedin,
        SITE_CONFIG.links.leetcode,
        SITE_CONFIG.links.spotify
      ],
      'knowsAbout': [
        'Computer Engineering',
        'Full-Stack Web Development',
        'C++',
        'React',
        'Node.js',
        'Relational Databases',
        'Algorithms & Data Structures'
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <div className="w-full">
      <SEO
        title={SITE_CONFIG.title}
        description={SITE_CONFIG.description}
        canonicalUrl={SITE_CONFIG.url}
        ogType="website"
        jsonLd={homeJsonLd}
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
