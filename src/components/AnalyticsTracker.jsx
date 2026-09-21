import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '../services/analyticsService';

/**
 * AnalyticsTracker
 * Non-visual component mounted inside <Router> that anonymously records page views
 * and project views upon route transitions.
 *
 * Privacy-conscious:
 * - Omits /admin routes to protect administrative operations and avoid skewing visitor data
 * - Non-blocking: will never interrupt UI rendering or navigation
 * - Deduplicates StrictMode instant re-fires
 */
export default function AnalyticsTracker() {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;

    // Filter out administrative console operations
    if (currentPath.startsWith('/admin')) {
      return;
    }

    // Deduplicate identical instantaneous hits (React StrictMode double-mounting)
    if (lastPathRef.current === currentPath) {
      return;
    }
    lastPathRef.current = currentPath;

    // Small delay allows document.title to update if set by page components
    const timer = setTimeout(() => {
      let projectId = null;
      if (currentPath.startsWith('/projects/')) {
        const parts = currentPath.split('/');
        if (parts[2]) {
          projectId = parts[2];
        }
      }

      recordPageView({
        path: currentPath,
        title: document.title || 'Harshit Rai Portfolio',
        projectId
      }).catch((err) => {
        // Safe non-blocking catch
        console.warn('[AnalyticsTracker] Non-blocking telemetry catch:', err);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
