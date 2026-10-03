import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

const LOCAL_STORAGE_ANALYTICS_KEY = 'harshit_portfolio_analytics_events';
const SESSION_STORAGE_KEY = 'harshit_portfolio_ephemeral_session';

/**
 * Retrieve or generate an ephemeral, non-identifying session ID for the browser tab.
 * This does NOT persist across closed tabs and contains zero personal data.
 */
function getEphemeralSessionId() {
  if (typeof window === 'undefined') return 'srv-session';
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return 'anon-session';
  }
}

/**
 * Detect coarse device category without fingerprinting or inspecting private hardware
 */
function getCoarseDeviceCategory() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Categorize high-level referrer source without storing granular query params or private URLs
 */
function getCoarseReferrerCategory() {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  try {
    const refUrl = new URL(document.referrer);
    const host = refUrl.hostname.toLowerCase();
    if (host.includes('github.com')) return 'github';
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('google.') || host.includes('bing.') || host.includes('duckduckgo.')) return 'search';
    if (host === window.location.hostname) return 'internal';
    return 'external';
  } catch {
    return 'direct';
  }
}

/**
 * Retrieve events from local storage (used for offline resilience, demo mode, and instant display)
 */
function getLocalEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANALYTICS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save events to local storage
 */
function saveLocalEvents(events) {
  if (typeof window === 'undefined') return;
  try {
    // Keep max 2000 events locally to avoid storage bloat
    const trimmed = events.slice(-2000);
    localStorage.setItem(LOCAL_STORAGE_ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[Analytics] Local storage write notice:', err);
  }
}

/**
 * Record a privacy-conscious anonymous page or project view event.
 * Non-blocking: will never throw errors or halt the user experience.
 *
 * @param {Object} eventData
 * @param {string} eventData.path - The relative URL path (e.g., '/', '/projects/ai-portfolio')
 * @param {string} [eventData.title] - Non-sensitive page title
 * @param {string} [eventData.projectId] - Optional project ID for project views
 */
export async function recordPageView({ path, title, projectId = null }) {
  // Never record analytics for admin routes
  if (!path || path.startsWith('/admin')) {
    return;
  }

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const isProjectView = Boolean(projectId || path.startsWith('/projects/'));
    const resolvedProjectId = projectId || (path.startsWith('/projects/') ? path.split('/')[2] : null);

    const anonymousEvent = {
      path,
      title: title || (isProjectView ? `Project: ${resolvedProjectId}` : 'Portfolio Page'),
      isProjectView,
      projectId: resolvedProjectId || null,
      device: getCoarseDeviceCategory(),
      referrer: getCoarseReferrerCategory(),
      sessionId: getEphemeralSessionId(),
      date: dateStr,
      timestamp: now.toISOString(),
      source: isFirebaseConfigured ? 'firebase' : 'local'
    };

    // 1. Dual-write to local storage buffer first (instantaneous & offline-safe)
    const currentLocal = getLocalEvents();
    currentLocal.push(anonymousEvent);
    saveLocalEvents(currentLocal);

    // 2. If Firebase is active, persist to Firestore in a fire-and-forget background promise
    if (isFirebaseConfigured && db) {
      addDoc(collection(db, COLLECTIONS.ANALYTICS), {
        ...anonymousEvent,
        createdAt: serverTimestamp()
      }).catch((firestoreErr) => {
        // Silently capture Firestore errors (e.g. ad-blocker or offline) without surfacing to user
        console.warn('[Analytics] Firestore telemetry write caught non-blocking notice:', firestoreErr.message);
      });
    }
  } catch (err) {
    // Top-level catch to ensure complete non-blocking immunity
    console.warn('[Analytics] Non-blocking telemetry tracking notice:', err);
  }
}

/**
 * Generate a continuous array of date strings for the last N days (YYYY-MM-DD)
 */
function getLastNDays(numDays = 14) {
  const dates = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Format date string (YYYY-MM-DD) to friendly short label (e.g., 'Sep 21')
 */
function formatShortDate(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Fetch and aggregate privacy-conscious metrics over a given timeframe (days)
 *
 * @param {number} [days=14] - Number of days to include in the trend analysis
 * @returns {Promise<Object>} Aggregated analytics summary
 */
export async function getAnalyticsSummary(days = 14) {
  let allEvents = [];

  // Attempt to fetch from Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, COLLECTIONS.ANALYTICS),
        orderBy('createdAt', 'desc'),
        limit(1500)
      );
      const snapshot = await getDocs(q);
      const remoteEvents = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let timestampIso = new Date().toISOString();
        if (data.createdAt?.toDate) {
          timestampIso = data.createdAt.toDate().toISOString();
        } else if (data.timestamp) {
          timestampIso = data.timestamp;
        }
        return {
          id: docSnap.id,
          ...data,
          timestamp: timestampIso,
          date: data.date || timestampIso.split('T')[0]
        };
      });

      if (remoteEvents.length > 0) {
        allEvents = remoteEvents;
      } else {
        allEvents = [];
      }
    } catch (err) {
      console.warn('[Analytics] Error reading from Firestore:', err);
      allEvents = [];
    }
  } else {
    allEvents = getLocalEvents();
  }

  // Only generate demo dataset in development if explicitly enabled via VITE_ENABLE_DEMO_DATA=true
  if (allEvents.length === 0 && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
    allEvents = generateRealisticDemoEvents();
    saveLocalEvents(allEvents);
  }

  // Filter events within timeframe
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const filteredEvents = allEvents.filter((ev) => (ev.date || '9999-99-99') >= cutoffStr);

  // 1. Total counts
  const totalPageViews = filteredEvents.length;
  const projectViewEvents = filteredEvents.filter((ev) => ev.isProjectView);
  const totalProjectViews = projectViewEvents.length;

  // 2. Unique Ephemeral Sessions (0 if no traffic)
  const sessionSet = new Set(filteredEvents.map((ev) => ev.sessionId).filter(Boolean));
  const uniqueSessions = sessionSet.size;

  // 3. Daily Traffic Trends (Continuous timeline for the last N days)
  const daysList = getLastNDays(days);
  const dailyTrends = daysList.map((dateStr) => {
    const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);
    const dayProjectViews = dayEvents.filter((ev) => ev.isProjectView).length;
    return {
      date: dateStr,
      label: formatShortDate(dateStr),
      views: dayEvents.length,
      projectViews: dayProjectViews
    };
  });

  // Calculate peak day
  const maxDailyViews = Math.max(...dailyTrends.map((d) => d.views), 0);

  // 4. Project Views Breakdown
  const projectCounts = {};
  projectViewEvents.forEach((ev) => {
    const pId = ev.projectId || 'unknown';
    if (!projectCounts[pId]) {
      projectCounts[pId] = {
        id: pId,
        title: ev.title ? ev.title.replace(/^Project:\s*/, '') : pId,
        views: 0
      };
    }
    projectCounts[pId].views += 1;
  });

  const topProjects = Object.values(projectCounts)
    .sort((a, b) => b.views - a.views)
    .map((p) => ({
      ...p,
      percentage: totalProjectViews > 0 ? Math.round((p.views / totalProjectViews) * 100) : 0
    }));

  // 5. Top Visited Pages Breakdown
  const pageCounts = {};
  filteredEvents.forEach((ev) => {
    const path = ev.path || '/';
    pageCounts[path] = (pageCounts[path] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({
      path,
      views: count,
      percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // 6. Device Distribution
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  filteredEvents.forEach((ev) => {
    const dev = ev.device || 'desktop';
    if (deviceCounts[dev] !== undefined) {
      deviceCounts[dev] += 1;
    } else {
      deviceCounts.desktop += 1;
    }
  });

  // 7. Referrer Breakdown
  const referrerCounts = { direct: 0, github: 0, linkedin: 0, search: 0, external: 0 };
  filteredEvents.forEach((ev) => {
    const ref = ev.referrer || 'direct';
    if (referrerCounts[ref] !== undefined) {
      referrerCounts[ref] += 1;
    } else {
      referrerCounts.external += 1;
    }
  });

  return {
    timeframeDays: days,
    totalPageViews,
    totalProjectViews,
    uniqueSessions,
    maxDailyViews,
    dailyTrends,
    topProjects,
    topPages,
    deviceDistribution: {
      desktop: deviceCounts.desktop,
      mobile: deviceCounts.mobile,
      tablet: deviceCounts.tablet,
      desktopPct: totalPageViews > 0 ? Math.round((deviceCounts.desktop / totalPageViews) * 100) : 0,
      mobilePct: totalPageViews > 0 ? Math.round((deviceCounts.mobile / totalPageViews) * 100) : 0,
      tabletPct: totalPageViews > 0 ? Math.round((deviceCounts.tablet / totalPageViews) * 100) : 0
    },
    referrerBreakdown: {
      direct: referrerCounts.direct,
      github: referrerCounts.github,
      linkedin: referrerCounts.linkedin,
      search: referrerCounts.search,
      external: referrerCounts.external,
      directPct: totalPageViews > 0 ? Math.round((referrerCounts.direct / totalPageViews) * 100) : 0,
      githubPct: totalPageViews > 0 ? Math.round((referrerCounts.github / totalPageViews) * 100) : 0,
      linkedinPct: totalPageViews > 0 ? Math.round((referrerCounts.linkedin / totalPageViews) * 100) : 0,
      searchPct: totalPageViews > 0 ? Math.round((referrerCounts.search / totalPageViews) * 100) : 0,
      externalPct: totalPageViews > 0 ? Math.round((referrerCounts.external / totalPageViews) * 100) : 0
    }
  };
}

/**
 * Generate realistic anonymous demonstration traffic events spanning the last 14 days
 */
export function generateRealisticDemoEvents() {
  const events = [];
  const projectList = [
    { id: '1', title: 'Smart Surveillance & Anomaly Detection System' },
    { id: '2', title: 'Autonomous Quadcopter Navigation' },
    { id: '3', title: 'Distributed Cloud IDE' },
    { id: '4', title: 'High-Performance Edge AI Vision' },
    { id: '5', title: 'Low-Latency Mesh Protocol' }
  ];

  const devices = ['desktop', 'desktop', 'desktop', 'mobile', 'mobile', 'tablet'];
  const referrers = ['direct', 'direct', 'github', 'github', 'linkedin', 'linkedin', 'search'];

  const days = getLastNDays(14);

  days.forEach((dateStr, dayIndex) => {
    // Generate organic wave of traffic (e.g. 15 to 45 visits per day)
    const baseCount = 18 + Math.floor(Math.sin(dayIndex * 0.7) * 8) + Math.floor(Math.random() * 12);
    const daySessions = Math.max(Math.floor(baseCount * 0.75), 5);

    for (let i = 0; i < baseCount; i++) {
      const sessionId = `demo_ses_${dateStr}_${i % daySessions}`;
      const device = devices[Math.floor(Math.random() * devices.length)];
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];

      // 40% chance of visiting a project page
      const isProj = Math.random() < 0.42;
      let path = '/';
      let title = 'Harshit Rai | Portfolio';
      let projectId = null;

      if (isProj) {
        const chosenProj = projectList[Math.floor(Math.random() * projectList.length)];
        projectId = chosenProj.id;
        path = `/projects/${projectId}`;
        title = chosenProj.title;
      }

      events.push({
        path,
        title,
        isProjectView: isProj,
        projectId,
        device,
        referrer,
        sessionId,
        date: dateStr,
        timestamp: `${dateStr}T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00.000Z`,
        source: 'local'
      });
    }
  });

  return events;
}

/**
 * Seed realistic demonstration analytics into local storage
 */
export function seedDemoAnalytics() {
  const demoData = generateRealisticDemoEvents();
  saveLocalEvents(demoData);
  return demoData.length;
}

/**
 * Reset local analytics buffer
 */
export function clearAnalytics() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_ANALYTICS_KEY);
  } catch (err) {
    console.error('[Analytics] Error clearing local storage:', err);
  }
}

/**
 * Safely and strictly reset analytics data only.
 * This completely isolates analytics records and leaves all portfolio content intact.
 */
export async function resetAnalyticsData() {
  clearAnalytics();
  let remoteDeleted = 0;

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ANALYTICS));
      if (!snapshot.empty) {
        const deleteOps = snapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, COLLECTIONS.ANALYTICS, docSnap.id))
        );
        await Promise.all(deleteOps);
        remoteDeleted = snapshot.docs.length;
      }
    } catch (err) {
      console.warn('[Analytics] Firestore analytics deletion notice:', err.message);
    }
  }

  return { success: true, count: remoteDeleted };
}

