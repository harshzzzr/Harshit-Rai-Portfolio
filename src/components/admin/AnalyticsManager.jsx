import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  FolderGit2,
  Users,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  ShieldCheck,
  RefreshCw,
  Flame,
  Sparkles,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getAnalyticsSummary,
  seedDemoAnalytics,
  clearAnalytics
} from '../../services/analyticsService';

export default function AnalyticsManager({ onDataChanged }) {
  const [timeframe, setTimeframe] = useState(14); // 7, 14, 30 days
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary(timeframe);
      setSummary(data);
    } catch (err) {
      console.error('[AnalyticsManager] Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleSeedDemo = () => {
    const count = seedDemoAnalytics();
    setActionFeedback(`Generated ${count} anonymous demo traffic data points.`);
    fetchAnalytics();
    if (onDataChanged) onDataChanged();
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Reset local analytics buffer? This will clear local anonymous visitor history.')) {
      clearAnalytics();
      setActionFeedback('Analytics buffer cleared.');
      fetchAnalytics();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const topProject = summary?.topProjects?.[0] || null;
  const avgDailyViews = summary && summary.timeframeDays > 0
    ? Math.round(summary.totalPageViews / summary.timeframeDays)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Traffic & Audience Analytics</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={12} />
                <span>Privacy-First</span>
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              100% anonymous telemetry • Zero IP addresses • No personal cookies
            </p>
          </div>
        </div>

        {/* Timeframe & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            {[
              { days: 7, label: '7D' },
              { days: 14, label: '14D' },
              { days: 30, label: '30D' },
            ].map((btn) => (
              <button
                key={btn.days}
                onClick={() => setTimeframe(btn.days)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeframe === btn.days
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Seed Demo Data (Development testing only) */}
          {import.meta.env.VITE_ENABLE_DEMO_DATA === 'true' && (
            <button
              onClick={handleSeedDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 text-xs font-medium transition-colors cursor-pointer"
              title="Seed anonymous demonstration traffic events"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Simulate Data</span>
            </button>
          )}

          {/* Reset Buffer */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Reset local analytics data"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Page Views */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Page Views
            </span>
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : (summary?.totalPageViews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span>~{avgDailyViews} views/day over last {timeframe}D</span>
            </p>
          </div>
        </div>

        {/* Project Detail Views */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Project Views
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FolderGit2 size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : (summary?.totalProjectViews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {summary && summary.totalPageViews > 0
                ? `${Math.round((summary.totalProjectViews / summary.totalPageViews) * 100)}% of total portfolio visits`
                : 'Deep-dive build views'}
            </p>
          </div>
        </div>

        {/* Ephemeral Tab Sessions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unique Sessions
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : (summary?.uniqueSessions || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ephemeral tab sessions
            </p>
          </div>
        </div>

        {/* Top Performer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Top Visited Project
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {loading ? '...' : (topProject ? topProject.title : 'No project data')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {topProject ? `${topProject.views} views (${topProject.percentage}% share)` : 'Browse builds to generate'}
            </p>
          </div>
        </div>
      </div>

      {/* Traffic Trends Chart Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Daily Traffic Trends</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily anonymous page impressions & project views over the last {timeframe} days
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" />
              <span>Total Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
              <span>Project Views</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart Visualization */}
        {loading ? (
          <div className="h-56 flex items-center justify-center text-xs text-slate-400">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span>Calculating timeline telemetry...</span>
          </div>
        ) : !summary || summary.dailyTrends.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-slate-400">
            No activity logged for this timeframe yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Area */}
            <div className="overflow-x-auto touch-scroll pb-1">
              <div className="h-56 min-w-[320px] sm:min-w-full flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                {summary.dailyTrends.map((day) => {
                  const totalPct = Math.max(Math.round((day.views / summary.maxDailyViews) * 100), 4);
                  const isHovered = hoveredDay?.date === day.date;
                  const isPeak = day.views === summary.maxDailyViews && day.views > 0;

                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute -top-14 z-20 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] shadow-lg whitespace-nowrap pointer-events-none transform -translate-y-1 transition-all">
                          <div className="font-semibold">{day.label}</div>
                          <div className="text-slate-300">
                            {day.views} total • {day.projectViews} project views
                          </div>
                        </div>
                      )}

                      {/* Peak Day Indicator */}
                      {isPeak && !isHovered && (
                        <span className="absolute -top-5 text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400 uppercase">
                          Peak
                        </span>
                      )}

                      {/* Total Views Bar Container */}
                      <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg flex flex-col justify-end overflow-hidden transition-all group-hover:opacity-90" style={{ height: `${totalPct}%` }}>
                        {/* Project views nested sub-bar */}
                        <div
                          className="w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-none"
                          style={{ height: `${day.views > 0 ? (day.projectViews / day.views) * 100 : 0}%` }}
                        />
                        <div
                          className={`w-full rounded-t-lg transition-colors ${
                            isHovered
                              ? 'bg-primary-600 dark:bg-primary-400'
                              : 'bg-primary-500 dark:bg-primary-500'
                          }`}
                          style={{ height: `${day.views > 0 ? ((day.views - day.projectViews) / day.views) * 100 : 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Date Labels */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 px-1">
              <span>{summary.dailyTrends[0]?.label}</span>
              <span className="hidden sm:inline">{summary.dailyTrends[Math.floor(summary.dailyTrends.length / 2)]?.label}</span>
              <span>{summary.dailyTrends[summary.dailyTrends.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Section: Project Popularity & Audience Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Popular Projects Ranking */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Project Page Popularity</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {summary?.topProjects?.length || 0} builds tracked
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading project breakdown...</div>
          ) : !summary || summary.topProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No project page views recorded yet. Visit any project to log metrics.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.topProjects.map((proj, idx) => (
                <div key={proj.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        : idx === 1
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {proj.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Progress Bar */}
                        <div className="w-24 sm:w-36 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${proj.percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {proj.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {proj.views}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">views</span>
                    </div>
                    <Link
                      to={`/projects/${proj.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Preview live project page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Audience & Sources Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Device Distribution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Device Distribution</span>
            </h3>

            <div className="space-y-3">
              {/* Desktop */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Laptop size={14} className="text-slate-400" />
                    <span>Desktop</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    {summary?.deviceDistribution?.desktopPct || 0}% ({summary?.deviceDistribution?.desktop || 0})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${summary?.deviceDistribution?.desktopPct || 0}%` }}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Smartphone size={14} className="text-slate-400" />
                    <span>Mobile</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    {summary?.deviceDistribution?.mobilePct || 0}% ({summary?.deviceDistribution?.mobile || 0})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${summary?.deviceDistribution?.mobilePct || 0}%` }}
                  />
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Tablet size={14} className="text-slate-400" />
                    <span>Tablet</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    {summary?.deviceDistribution?.tabletPct || 0}% ({summary?.deviceDistribution?.tablet || 0})
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${summary?.deviceDistribution?.tabletPct || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Traffic Inbound Channels</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Direct / Bookmarks', count: summary?.referrerBreakdown?.direct || 0, pct: summary?.referrerBreakdown?.directPct || 0, color: 'bg-primary-500' },
                { name: 'GitHub Profiles / Repos', count: summary?.referrerBreakdown?.github || 0, pct: summary?.referrerBreakdown?.githubPct || 0, color: 'bg-slate-700 dark:bg-slate-400' },
                { name: 'LinkedIn', count: summary?.referrerBreakdown?.linkedin || 0, pct: summary?.referrerBreakdown?.linkedinPct || 0, color: 'bg-sky-600' },
                { name: 'Search Engines', count: summary?.referrerBreakdown?.search || 0, pct: summary?.referrerBreakdown?.searchPct || 0, color: 'bg-amber-500' },
                { name: 'External Referrals', count: summary?.referrerBreakdown?.external || 0, pct: summary?.referrerBreakdown?.externalPct || 0, color: 'bg-teal-500' },
              ].map((src) => (
                <div key={src.name}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{src.name}</span>
                    <span className="font-mono text-slate-500">{src.pct}% ({src.count})</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${src.color}`} style={{ width: `${src.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Standards & Resilience Assurance Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Strict Privacy & Resilience Architecture
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              No tracking cookies or canvas fingerprints. Telemetry fails silently and never disrupts visitors. Metrics remain strictly confidential to authenticated administrators.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 shrink-0">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>GDPR Compliant By Design</span>
        </div>
      </div>
    </div>
  );
}
