import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  clearGitHubCache,
  getLanguageColor,
  GITHUB_USERNAME,
  GITHUB_PROFILE_URL
} from '../services/githubService';
import { GithubIcon } from './Icons';
import {
  ExternalLink,
  Star,
  GitFork,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  FolderGit2,
  Code2,
  Users,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export default function GitHubSection() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const loadGitHubData = async (forceRefresh = false) => {
    setLoading(true);
    setIsRateLimited(false);

    if (forceRefresh) {
      clearGitHubCache();
    }

    try {
      const [profRes, repoRes] = await Promise.all([
        fetchGitHubProfile(),
        fetchGitHubRepos(undefined, 12)
      ]);

      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      }

      if (repoRes.data && Array.isArray(repoRes.data)) {
        setRepos(repoRes.data);
      }

      if (repoRes.rateLimited || profRes.rateLimited) {
        setIsRateLimited(true);
      }

      if (repoRes.isFallback) {
        setIsFallback(true);
      } else {
        setIsFallback(false);
      }
    } catch (err) {
      console.warn('[GitHubSection] Error fetching GitHub data:', err);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGitHubData();
  }, []);

  // Compute available languages
  const languages = useMemo(() => {
    const set = new Set();
    repos.forEach((r) => {
      if (r.language && r.language !== 'Code') {
        set.add(r.language);
      }
    });
    return ['All', ...Array.from(set)];
  }, [repos]);

  // Filter repositories
  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      if (selectedLanguage !== 'All' && r.language !== selectedLanguage) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (r.name || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [repos, selectedLanguage, searchQuery]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <section id="github" className="py-20 bg-slate-50/60 dark:bg-slate-900/40 relative border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-3 shadow-xs">
            <GithubIcon size={14} />
            <span>Public Open-Source Footprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            GitHub Dynamic Repositories
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Live public repositories and systems code synchronized via the official GitHub REST API. Inspect open-source contributions, algorithms, and technical prototypes.
          </p>
        </div>

        {/* Profile Stats & API Status Bar */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-white p-2.5 flex items-center justify-center shadow-md">
                  <GithubIcon size={30} />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center ${
                    !isFallback ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={!isFallback ? 'Live GitHub API' : 'Cached / Catalog Mode'}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
                    {profile?.name || 'Harshit Rai'}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    @{profile?.login || GITHUB_USERNAME}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md line-clamp-1 mt-0.5">
                  {profile?.bio || 'Computer Engineering Student & Full-Stack Systems Developer'}
                </p>
              </div>
            </div>

            {/* Counts & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 self-start md:self-auto w-full md:w-auto">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {profile?.publicRepos ?? repos.length}
                  </strong>{' '}
                  <span className="text-slate-400 text-[11px]">Repos</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {profile?.followers ?? 0}
                  </strong>{' '}
                  <span className="text-slate-400 text-[11px]">Followers</span>
                </span>
              </div>

              <button
                onClick={() => loadGitHubData(true)}
                disabled={loading}
                aria-label="Force refresh GitHub data from API"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>

              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Harshit Rai GitHub profile (opens in new tab)"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-primary-500 flex-1 sm:flex-initial"
              >
                <span>View on GitHub</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Rate-Limit / Fallback Notice Banner */}
        {isRateLimited && (
          <div role="status" className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-amber-500" aria-hidden="true" />
              <span>
                GitHub API rate limit reached (60 unauthenticated requests/hr). Displaying verified catalog repositories with direct links.
              </span>
            </div>
            <button
              onClick={() => loadGitHubData(true)}
              className="font-semibold underline hover:no-underline shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Search & Language Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Language filter pills */}
          <div role="group" aria-label="Filter repositories by language" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                aria-pressed={selectedLanguage === lang}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  selectedLanguage === lang
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang !== 'All' && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getLanguageColor(lang) }}
                    aria-hidden="true"
                  />
                )}
                <span>{lang}</span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search repositories by name or description"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear repository search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Repositories Cards Grid */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                <div className="pt-2 flex items-center justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRepos.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <FolderGit2 size={24} />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Repositories Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No repositories matching "${searchQuery}" in ${selectedLanguage}.`
                : `No public repositories found under ${selectedLanguage}.`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLanguage('All');
              }}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Repositories Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Title & Link icon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderGit2 size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {repo.name}
                      </h4>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0 mt-0.5"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {repo.description || 'Public engineering project repository.'}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  {/* Language */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    />
                    <span className="truncate max-w-[90px]">{repo.language}</span>
                  </div>

                  {/* Stars & Forks */}
                  <div className="flex items-center gap-3 shrink-0">
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-0.5" title={`${repo.stars} stars`}>
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>{repo.stars}</span>
                      </span>
                    )}

                    {repo.forks > 0 && (
                      <span className="flex items-center gap-0.5" title={`${repo.forks} forks`}>
                        <GitFork size={12} className="text-slate-400" />
                        <span>{repo.forks}</span>
                      </span>
                    )}

                    {repo.updatedAt && (
                      <span className="text-[10px] text-slate-400" title="Last updated">
                        {formatDate(repo.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
