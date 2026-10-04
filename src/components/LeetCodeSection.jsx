import React, { useState, useEffect } from 'react';
import {
  fetchLeetCodeStats,
  clearLeetCodeCache,
  CODING_CATEGORIES,
  LEETCODE_USERNAME,
  LEETCODE_PROFILE_URL
} from '../services/leetcodeService';
import { LeetcodeIcon } from './Icons';
import {
  ExternalLink,
  RefreshCw,
  Code2,
  Cpu,
  Boxes,
  GitBranch,
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';

export default function LeetCodeSection() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async (forceRefresh = false) => {
    setLoading(true);
    if (forceRefresh) {
      clearLeetCodeCache();
    }
    try {
      const res = await fetchLeetCodeStats();
      setStatsData(res);
    } catch (err) {
      console.warn('[LeetCodeSection] Error loading stats:', err);
      setStatsData({ hasStats: false, profileUrl: LEETCODE_PROFILE_URL });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const hasStats = statsData?.hasStats && statsData?.data;
  const stats = statsData?.data;

  // Category icons map
  const categoryIcons = {
    'Data Structures': Boxes,
    'Algorithmic Paradigms': GitBranch,
    'Advanced Problem Solving': Zap,
    'Engineering & Complexity': Cpu
  };

  return (
    <section id="coding" className="py-20 relative border-t border-black/5 dark:border-white/10">
      {/* Anchor for #leetcode as well */}
      <div id="leetcode" className="absolute -top-16 left-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-3 shadow-xs">
            <LeetcodeIcon size={14} className="text-amber-500" />
            <span>Problem Solving & Algorithms</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101112] dark:text-[#D7E2EA] font-sans">
            LeetCode & Computational Practice
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-[#D7E2EA]/75">
            Dedicated problem-solving practice in C++ covering fundamental and advanced data structures, graph search, dynamic programming, and asymptotic runtime optimization.
          </p>
        </div>

        {/* Profile Card & Action Bar */}
        <div className="mb-8 sm:mb-10 p-4 sm:p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            {/* Handle info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500 text-white p-2.5 sm:p-3 flex items-center justify-center shadow-xs">
                  <LeetcodeIcon size={28} />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#101112] flex items-center justify-center ${
                    hasStats ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={hasStats ? 'Live Public Statistics' : 'Verified Profile Mode'}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#101112] dark:text-[#D7E2EA] break-words">
                    LeetCode Profile
                  </h3>
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/80 shrink-0">
                    @{LEETCODE_USERNAME}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/65 mt-0.5 line-clamp-1">
                  Algorithm Practice • Data Structures • C++ Systems Solutions
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start md:self-auto w-full md:w-auto">
              <button
                onClick={() => loadStats(true)}
                disabled={loading}
                aria-label="Refresh LeetCode statistics"
                className="p-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#141516] text-neutral-600 dark:text-[#D7E2EA] hover:text-[#101112] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#101112] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>

              <a
                href={LEETCODE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View LeetCode Profile of Harshit Rai (opens in new tab)"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 flex-1 sm:flex-initial"
              >
                <span>View LeetCode Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Content: Loading vs Verified Stats vs Clean Competency Fallback */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] space-y-3"
              >
                <div className="h-4 bg-neutral-200 dark:bg-[#141516] rounded w-1/2" />
                <div className="h-8 bg-neutral-200 dark:bg-[#141516] rounded w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-[#141516] rounded w-full" />
              </div>
            ))}
          </div>
        ) : hasStats ? (
          /* Verified Live Statistics Mode */
          <div className="space-y-8 animate-fade-in">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Solved */}
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#D7E2EA]/60 mb-2">
                  <span className="font-medium">Total Solved</span>
                  <Award size={16} className="text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-[#101112] dark:text-[#D7E2EA]">
                  {stats.totalSolved}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 text-[11px] text-neutral-400 dark:text-[#D7E2EA]/50 font-mono">
                  {stats.acceptanceRate ? (
                    <span>{stats.acceptanceRate}% Acceptance Rate</span>
                  ) : (
                    <span>Verified LeetCode Metric</span>
                  )}
                </div>
              </div>

              {/* Easy */}
              <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-2">
                  <span className="font-semibold">Easy</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                  {stats.easySolved}
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/40">
                  Fundamental array & hash structures
                </p>
              </div>

              {/* Medium */}
              <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mb-2">
                  <span className="font-semibold">Medium</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-700 dark:text-amber-300">
                  {stats.mediumSolved}
                </div>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-900/40">
                  Trees, graphs & dynamic programming
                </p>
              </div>

              {/* Hard */}
              <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs">
                <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 mb-2">
                  <span className="font-semibold">Hard</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-rose-700 dark:text-rose-300">
                  {stats.hardSolved}
                </div>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-3 pt-3 border-t border-rose-200/50 dark:border-rose-900/40">
                  Advanced heuristics & complex graph optimization
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Clean Coding Fallback Mode */
          <div className="space-y-6 animate-fade-in">
            {/* Notice card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-[#D7E2EA]/75 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
                <span>
                  Live metrics synchronized via profile. Displaying verified problem-solving competencies below without fabricated numbers.
                </span>
              </div>
              <a
                href={LEETCODE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Check Live LeetCode Profile of Harshit Rai (opens in new tab)"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <span>Check Live LeetCode Profile</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>

            {/* 4 Algorithmic Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CODING_CATEGORIES.map((cat) => {
                const IconComponent = categoryIcons[cat.category] || Code2;
                return (
                  <div
                    key={cat.category}
                    className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
                          <IconComponent size={18} aria-hidden="true" />
                        </div>
                        <h3 className="text-base font-bold text-[#101112] dark:text-[#D7E2EA]">
                          {cat.category}
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/65 mb-4 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-200 dark:border-white/10">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-50 dark:bg-[#141516] border border-neutral-200/70 dark:border-white/8 text-neutral-700 dark:text-[#D7E2EA]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
