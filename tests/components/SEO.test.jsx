import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SEO from '../../src/components/SEO';
import { SITE_CONFIG } from '../../src/config/site';

describe('SEO Component', () => {
  beforeEach(() => {
    // Reset document head elements before each test
    document.title = '';
    const metas = document.querySelectorAll('meta');
    metas.forEach((m) => m.remove());
    const links = document.querySelectorAll('link[rel="canonical"]');
    links.forEach((l) => l.remove());
    const scripts = document.querySelectorAll('#dynamic-seo-jsonld');
    scripts.forEach((s) => s.remove());
  });

  it('sets document title and meta description from props', () => {
    render(
      <SEO
        title="Custom Title | Harshit Rai"
        description="Custom SEO Description for Harshit Rai"
      />
    );

    expect(document.title).toBe('Custom Title | Harshit Rai');
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).not.toBeNull();
    expect(metaDesc.getAttribute('content')).toBe('Custom SEO Description for Harshit Rai');
  });

  it('sets canonical link and robots index tags by default', () => {
    render(
      <SEO
        canonicalUrl="https://harshit-rai-portfolio.vercel.app/projects/campus-connect"
      />
    );

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).not.toBeNull();
    expect(canonical.getAttribute('href')).toBe('https://harshit-rai-portfolio.vercel.app/projects/campus-connect');

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots.getAttribute('content')).toBe('index, follow');
  });

  it('sets noindex, nofollow when noindex prop is true', () => {
    render(
      <SEO
        title="Admin Console | Harshit Rai"
        noindex={true}
      />
    );

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('injects JSON-LD script and cleans it up on unmount', () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Harshit Rai',
      'url': SITE_CONFIG.url
    };

    const { unmount } = render(
      <SEO
        title="Harshit Rai | Developer Portfolio"
        jsonLd={jsonLd}
      />
    );

    let script = document.getElementById('dynamic-seo-jsonld');
    expect(script).not.toBeNull();
    expect(JSON.parse(script.textContent)).toEqual(jsonLd);

    unmount();
    script = document.getElementById('dynamic-seo-jsonld');
    expect(script).toBeNull();
  });
});
