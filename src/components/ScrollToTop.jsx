import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop
 *
 * Ensures proper scroll positioning across route changes:
 * - Navigating to a new route scrolls to (0, 0) instantly.
 * - In-page anchor navigation (#projects, #contact) smoothly scrolls to target element.
 * - Browser back/forward (POP) navigation respects browser history restoration.
 * - Never forces scroll-to-top when navigating to an anchor.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // 1. In-page anchor navigation
    if (hash) {
      const elementId = hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Element may render asynchronously after route transition
        const timer = setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
      prevPathname.current = pathname;
      return;
    }

    // 2. Browser Back/Forward (POP) without hash - allow browser native scroll restoration
    if (navType === 'POP' && prevPathname.current === pathname) {
      return;
    }

    // 3. New route navigation without hash - scroll cleanly to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    prevPathname.current = pathname;
  }, [pathname, hash, navType]);

  return null;
}
