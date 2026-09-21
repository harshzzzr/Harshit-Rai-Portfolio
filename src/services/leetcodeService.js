import { personalInfo } from '../data/portfolioData';

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

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
    // Ignore cache failure
  }
}

export const LEETCODE_USERNAME =
  import.meta.env.VITE_LEETCODE_USERNAME || personalInfo.socials.leetcodeUsername || 'harshitrai';

export const LEETCODE_PROFILE_URL =
  import.meta.env.VITE_LEETCODE_URL || personalInfo.socials.leetcode || `https://leetcode.com/u/${LEETCODE_USERNAME}`;

export const VERIFIED_ALGORITHMIC_TOPICS = [
  'Data Structures & Algorithms',
  'Array & String Manipulation',
  'Binary Trees & Graphs',
  'Dynamic Programming',
  'Recursion & Backtracking',
  'Object-Oriented Problem Solving'
];

/**
 * Fetch verified LeetCode statistics via reliable public proxy API
 * CRITICAL RULE: Never invent statistics. If the API is unreachable,
 * hasStats is false and verified direct profile links are rendered.
 */
export async function fetchLeetCodeStats(username = LEETCODE_USERNAME) {
  const cacheKey = `leetcode_stats_${username}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { success: true, hasStats: Boolean(cached.totalSolved), data: cached };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout for snappy UI

    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        hasStats: false,
        profileUrl: LEETCODE_PROFILE_URL,
        topics: VERIFIED_ALGORITHMIC_TOPICS
      };
    }

    const json = await response.json();

    if (json && json.status === 'success' && typeof json.totalSolved === 'number' && json.totalSolved > 0) {
      const stats = {
        totalSolved: json.totalSolved,
        easySolved: json.easySolved ?? 0,
        mediumSolved: json.mediumSolved ?? 0,
        hardSolved: json.hardSolved ?? 0,
        acceptanceRate: json.acceptanceRate ?? null,
        ranking: json.ranking ?? null,
        profileUrl: LEETCODE_PROFILE_URL
      };

      setCached(cacheKey, stats);
      return { success: true, hasStats: true, data: stats };
    }

    // No verified stats available — do not invent numbers
    return {
      success: true,
      hasStats: false,
      profileUrl: LEETCODE_PROFILE_URL,
      topics: VERIFIED_ALGORITHMIC_TOPICS
    };
  } catch {
    // Graceful offline/network failure
    return {
      success: false,
      hasStats: false,
      profileUrl: LEETCODE_PROFILE_URL,
      topics: VERIFIED_ALGORITHMIC_TOPICS
    };
  }
}
