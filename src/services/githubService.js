import { personalInfo, projectsData } from '../data/portfolioData';

const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes session cache to prevent rate-limiting

export const GITHUB_USERNAME =
  import.meta.env.VITE_GITHUB_USERNAME || personalInfo.socials.githubUsername || 'harshzzzr';

export const GITHUB_PROFILE_URL =
  import.meta.env.VITE_GITHUB_URL || personalInfo.socials.github || `https://github.com/${GITHUB_USERNAME}`;

/**
 * Recognized programming language color map for badges
 */
export const GITHUB_LANG_COLORS = {
  'C++': '#f34b7d',
  'C': '#555555',
  'Python': '#3572A5',
  'Java': '#b07219',
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Shell': '#89e051',
  'Arduino': '#bd79d1',
  'Jupyter Notebook': '#DA5B0B',
  'SQL': '#e38c00',
  'Go': '#00ADD8',
  'Rust': '#dea584'
};

export function getLanguageColor(lang) {
  if (!lang) return '#94a3b8';
  return GITHUB_LANG_COLORS[lang] || '#0ea5e9';
}

function getCached(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

function setCached(key, data) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGitHubCache(username = GITHUB_USERNAME) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`gh_profile_${username}`);
    sessionStorage.removeItem(`gh_repos_${username}_12`);
    sessionStorage.removeItem(`gh_repos_${username}_6`);
  } catch {
    // Ignore
  }
}

/**
 * Fetch public GitHub Profile information
 * Fails gracefully if rate-limited or offline
 */
export async function fetchGitHubProfile(username = GITHUB_USERNAME) {
  const cacheKey = `gh_profile_${username}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        rateLimited: response.status === 403 || response.status === 429,
        fallbackUrl: GITHUB_PROFILE_URL
      };
    }

    const json = await response.json();
    const profile = {
      login: json.login,
      name: json.name || personalInfo.name,
      avatarUrl: json.avatar_url,
      bio: json.bio || personalInfo.shortBio,
      publicRepos: json.public_repos ?? 0,
      followers: json.followers ?? 0,
      following: json.following ?? 0,
      htmlUrl: json.html_url || GITHUB_PROFILE_URL,
      createdAt: json.created_at
    };

    setCached(cacheKey, profile);
    return { success: true, data: profile };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      fallbackUrl: GITHUB_PROFILE_URL
    };
  }
}

/**
 * Fetch public repositories only
 * Private repositories are never exposed or accessed
 * Falls back to verified catalog projects if rate-limited or offline
 */
export async function fetchGitHubRepos(username = GITHUB_USERNAME, limit = 12) {
  const cacheKey = `gh_repos_${username}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  try {
    // Queries only public repositories
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=${limit}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        rateLimited: response.status === 403 || response.status === 429,
        isFallback: true,
        data: getFallbackRepos()
      };
    }

    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) {
      return { success: true, isFallback: true, data: getFallbackRepos() };
    }

    const repos = list.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || 'Open source engineering project repository.',
      htmlUrl: r.html_url,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      language: r.language || 'Code',
      isFork: Boolean(r.fork),
      topics: Array.isArray(r.topics) ? r.topics : [],
      updatedAt: r.updated_at
    }));

    setCached(cacheKey, repos);
    return { success: true, isFallback: false, data: repos };
  } catch {
    return {
      success: false,
      isFallback: true,
      data: getFallbackRepos()
    };
  }
}

/**
 * Verified fallback repository data derived from actual portfolio projects
 * Ensures public users always see verified repos even if GitHub API is rate-limited
 */
function getFallbackRepos() {
  return projectsData.map((p, idx) => ({
    id: `local-repo-${p.id || idx}`,
    name: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: p.shortDescription || p.tagline,
    htmlUrl: p.githubUrl || GITHUB_PROFILE_URL,
    stars: 0,
    forks: 0,
    language: (p.technologies && p.technologies[0]) || 'C++',
    isFork: false,
    topics: p.technologies || [],
    updatedAt: new Date().toISOString()
  }));
}
