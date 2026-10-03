import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetAnalyticsData,
  clearAnalytics,
  recordPageView,
  getAnalyticsSummary,
} from '../../src/services/analyticsService';

describe('Analytics Isolation & Reset', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('records telemetry and properly clears only analytics data on reset', async () => {
    // 1. Record an event
    await recordPageView({ path: '/projects/campus-connect', title: 'Campus Connect' });

    // 2. Fetch summary before reset
    const summaryBefore = await getAnalyticsSummary(7);
    expect(summaryBefore.totalPageViews).toBeGreaterThanOrEqual(1);

    // 3. Reset analytics
    const res = await resetAnalyticsData();
    expect(res.success).toBe(true);

    // 4. Verify analytics summary is reset
    const summaryAfter = await getAnalyticsSummary(7);
    expect(summaryAfter.totalPageViews).toBe(0);
    expect(summaryAfter.totalProjectViews).toBe(0);
  });

  it('clearAnalytics clears local analytics storage key without wiping unrelated preferences', () => {
    localStorage.setItem('harshit_portfolio_theme', 'dark');
    localStorage.setItem('harshit_portfolio_analytics_events', JSON.stringify([{ path: '/' }]));

    clearAnalytics();

    expect(localStorage.getItem('harshit_portfolio_analytics_events')).toBeNull();
    expect(localStorage.getItem('harshit_portfolio_theme')).toBe('dark');
  });
});
