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
 *
 * Tailored for WhatsApp, LinkedIn, X (Twitter), Facebook, and Discord preview crawlers.
 */
export default function SEO({
  title = 'Harshit Rai | Developer Portfolio',
  description = 'Explore the portfolio of Harshit Rai: Computer Engineering student and developer specializing in C++, React, Node.js, and high-performance software systems.',
  canonicalUrl = 'https://harshitrai.com/',
  ogType = 'website',
  ogImage = 'https://harshitrai.com/images/og-preview.png',
  imageAlt = 'Harshit Rai - Developer Portfolio Preview',
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

    // 4. Open Graph Metadata (LinkedIn, WhatsApp, Facebook, Discord)
    setMetaTag('property', 'og:site_name', 'Harshit Rai Developer Portfolio');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:locale', 'en_US');

    if (canonicalUrl) {
      setMetaTag('property', 'og:url', canonicalUrl);
    }

    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('property', 'og:image:secure_url', ogImage);
      setMetaTag('property', 'og:image:type', 'image/png');
      setMetaTag('property', 'og:image:width', '1200');
      setMetaTag('property', 'og:image:height', '630');
      setMetaTag('property', 'og:image:alt', imageAlt);
    }

    // 5. Twitter / X Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@harshitrai');
    setMetaTag('name', 'twitter:creator', '@harshitrai');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
      setMetaTag('name', 'twitter:image:alt', imageAlt);
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

    // Cleanup on unmount
    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, [title, description, canonicalUrl, ogType, ogImage, imageAlt, noindex, jsonLd]);

  return null;
}
