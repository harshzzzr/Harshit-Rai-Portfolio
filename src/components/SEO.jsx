import { useEffect } from 'react';

/**
 * Set or create a <meta> tag in the document <head>
 */
function setMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}

/**
 * Set or create a <link> tag in the document <head>
 */
function setLinkTag(rel, href) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href || '');
}

/**
 * SEO Component
 * Dynamically synchronizes document title, meta descriptions, canonical URLs,
 * Open Graph, Twitter cards, and JSON-LD structured data upon page transitions.
 */
export default function SEO({
  title = 'Harshit Rai | Developer Portfolio',
  description = 'Personal portfolio of Harshit Rai — Computer Engineering student and developer specializing in full-stack web applications, C++, system architecture, and algorithmic problem solving.',
  canonicalUrl = 'https://harshitrai.dev/',
  ogType = 'website',
  ogImage = 'https://harshitrai.dev/images/og-preview.png',
  noindex = false,
  jsonLd = null
}) {
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Primary Meta & Robots
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical Link
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    }

    // 4. Open Graph Metadata
    setMetaTag('property', 'og:site_name', 'Harshit Rai Developer Portfolio');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    if (canonicalUrl) {
      setMetaTag('property', 'og:url', canonicalUrl);
    }
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }

    // 5. Twitter / X Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
    }

    // 6. JSON-LD Structured Data
    const SCRIPT_ID = 'dynamic-seo-jsonld';
    let scriptEl = document.getElementById(SCRIPT_ID);

    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // Cleanup on unmount (revert to default portfolio title if needed)
    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, [title, description, canonicalUrl, ogType, ogImage, noindex, jsonLd]);

  return null;
}
