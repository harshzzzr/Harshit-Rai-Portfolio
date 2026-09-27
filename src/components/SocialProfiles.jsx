import React, { useState, useEffect } from 'react';
import {
  GithubIcon,
  LinkedinIcon,
  LeetcodeIcon,
  SpotifyIcon
} from './Icons';
import {
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  Code2,
  Headphones,
  ShieldCheck,
  Sparkles,
  Layers,
  Radio,
  BookOpen
} from 'lucide-react';
import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  GITHUB_PROFILE_URL,
  GITHUB_USERNAME
} from '../services/githubService';
import {
  fetchLeetCodeStats,
  LEETCODE_PROFILE_URL,
  LEETCODE_USERNAME,
  VERIFIED_ALGORITHMIC_TOPICS
} from '../services/leetcodeService';
import {
  getCurrentlyPlaying,
  SPOTIFY_PROFILE_URL
} from '../services/spotifyService';
import { personalInfo } from '../data/portfolioData';

export default function SocialProfiles() {
  // GitHub State
  const [ghProfile, setGhProfile] = useState(null);
  const [ghRepos, setGhRepos] = useState([]);
  const [loadingGh, setLoadingGh] = useState(true);

  // LeetCode State
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [loadingLeetcode, setLoadingLeetcode] = useState(true);

  // Spotify State
  const [spotifyData, setSpotifyData] = useState(null);
  const [loadingSpotify, setLoadingSpotify] = useState(true);

  useEffect(() => {
    // Load GitHub
    async function loadGitHub() {
      try {
        const [profRes, repoRes] = await Promise.all([
          fetchGitHubProfile(),
          fetchGitHubRepos(undefined, 3)
        ]);
        if (profRes.success && profRes.data) {
          setGhProfile(profRes.data);
        }
        if (repoRes.data && Array.isArray(repoRes.data)) {
          setGhRepos(repoRes.data.slice(0, 3));
        }
      } catch (err) {
        console.warn('[SocialProfiles] GitHub fetch caught:', err);
      } finally {
        setLoadingGh(false);
      }
    }

    // Load LeetCode
    async function loadLeetCode() {
      try {
        const res = await fetchLeetCodeStats();
        setLeetcodeData(res);
      } catch (err) {
        console.warn('[SocialProfiles] LeetCode fetch caught:', err);
      } finally {
        setLoadingLeetcode(false);
      }
    }

    // Load Spotify
    async function loadSpotify() {
      try {
        const res = await getCurrentlyPlaying();
        setSpotifyData(res);
      } catch (err) {
        console.warn('[SocialProfiles] Spotify fetch caught:', err);
      } finally {
        setLoadingSpotify(false);
      }
    }

    loadGitHub();
    loadLeetCode();
    loadSpotify();
  }, []);

  return (
    <section id="profiles" className="py-20 bg-white dark:bg-slate-950 relative border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 mb-3">
            <Radio size={13} />
            <span>Connected Profiles & Activity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Professional Presence & Ecosystem
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Real-time integrations across code repositories, algorithmic problem solving, professional network, and focus audio environments.
          </p>
        </div>

        {/* 4 Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* 1. GITHUB CARD */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-xs shrink-0">
                    <GithubIcon size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                      <span>GitHub</span>
                      <span className="text-[11px] font-mono font-normal text-slate-500 truncate">
                        @{GITHUB_USERNAME}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Open-Source Repositories & Architecture
                    </p>
                  </div>
                </div>

                <a
                  href={GITHUB_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Open GitHub Profile"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Bio / Stats */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                {ghProfile ? (
                  <div className="space-y-2">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ghProfile.bio || personalInfo.shortBio}
                    </p>
                    <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-slate-500">
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          {ghProfile.publicRepos}
                        </strong>{' '}
                        Repos
                      </span>
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          {ghProfile.followers}
                        </strong>{' '}
                        Followers
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {personalInfo.shortBio}
                  </p>
                )}
              </div>

              {/* Recent Public Repositories Preview */}
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-semibold">
                  Featured Repositories
                </h4>
                <div className="space-y-2">
                  {ghRepos.length > 0 ? (
                    ghRepos.map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 hover:border-primary-500/50 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          <span className="font-mono font-semibold truncate">{repo.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {repo.language}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {repo.description}
                        </p>
                      </a>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 font-mono">
                      Repositories available on profile.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Full GitHub Profile of Harshit Rai (opens in new tab)"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>View Full GitHub Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* 2. LINKEDIN CARD */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#0A66C2] text-white shadow-xs shrink-0">
                    <LinkedinIcon size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                      <span>LinkedIn</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                        <CheckCircle2 size={10} />
                        Verified
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Professional Network & Collaborations
                    </p>
                  </div>
                </div>

                <a
                  href={personalInfo.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#0A66C2] shrink-0"
                  aria-label="Open LinkedIn Profile of Harshit Rai in new tab"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>

              {/* Professional Profile Overview */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {personalInfo.name}
                  </h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                    {personalInfo.role}
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connecting with engineering teams, technology leaders, and fellow developers. Focused on backend scalability, modern web stacks, and algorithms.
                </p>
              </div>

              {/* Engagement Highlights */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Professional Focus
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-mono">Opportunity</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Internships & Roles
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-mono">Domain</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Software Engineering
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
              <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Harshit Rai on LinkedIn (opens in new tab)"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#0A66C2]"
              >
                <span>Connect on LinkedIn</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* 3. LEETCODE CARD */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                    <LeetcodeIcon size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                      <span>LeetCode</span>
                      <span className="text-[11px] font-mono font-normal text-slate-500 truncate">
                        @{LEETCODE_USERNAME}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Data Structures & Algorithmic Problem Solving
                    </p>
                  </div>
                </div>

                <a
                  href={LEETCODE_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
                  aria-label="Open LeetCode Profile of Harshit Rai in new tab"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Stats / Competencies (Zero fake stats guaranteed) */}
              {leetcodeData?.hasStats && leetcodeData?.data ? (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Verified Solved Problems</span>
                    <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                      {leetcodeData.data.totalSolved}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      <div className="font-bold">{leetcodeData.data.easySolved}</div>
                      <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Easy</div>
                    </div>
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                      <div className="font-bold">{leetcodeData.data.mediumSolved}</div>
                      <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Medium</div>
                    </div>
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                      <div className="font-bold">{leetcodeData.data.hardSolved}</div>
                      <div className="text-[10px] text-red-600/80 dark:text-red-400/80">Hard</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Code2 size={15} className="text-amber-500" aria-hidden="true" />
                    <span>Algorithmic Competencies</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Consistent problem solving in C++ covering rigorous dynamic programming, trees, graphs, and system design complexity.
                  </p>
                </div>
              )}

              {/* Topics Grid */}
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                  Core Problem Domains
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {VERIFIED_ALGORITHMIC_TOPICS.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
              <a
                href={LEETCODE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View LeetCode Profile of Harshit Rai (opens in new tab)"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span>View LeetCode Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* 4. SPOTIFY CARD */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#1DB954] text-white shadow-xs shrink-0">
                    <SpotifyIcon size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                      <span>Spotify</span>
                      {/* Equalizer animation */}
                      <span className="flex items-end gap-0.5 h-3 ml-1" aria-hidden="true">
                        <span className="w-0.5 h-2 bg-emerald-500 animate-pulse" />
                        <span className="w-0.5 h-3 bg-emerald-500 animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-emerald-500 animate-pulse delay-150" />
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Focus Beats & Development Soundtracks
                    </p>
                  </div>
                </div>

                <a
                  href={SPOTIFY_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#1DB954] shrink-0"
                  aria-label="Open Spotify Profile of Harshit Rai in new tab"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>

              {/* Status Audio Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones size={15} className="text-emerald-500" aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {spotifyData?.isPlaying ? 'Currently Listening' : 'Curated Coding Soundtrack'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {spotifyData?.isPlaying ? 'Streaming Now' : 'Coding Soundtrack'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {spotifyData?.title || 'Ambient Synthesizer & Algorithms'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {spotifyData?.artist || 'Harshit Rai Coding Flow Selection'}
                  </div>
                </div>
              </div>

              {/* Soundtracks List */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Focus Soundtracks
                </h4>
                <div className="space-y-1.5">
                  {(spotifyData?.soundtracks || []).slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{item.artist}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        {item.genre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
              <a
                href={SPOTIFY_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Spotify Profile of Harshit Rai (opens in new tab)"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1DB954] hover:bg-[#1aa34a] text-white font-semibold text-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#1DB954]"
              >
                <span>Open Spotify Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
