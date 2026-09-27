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

export function clearLeetCodeCache(username = LEETCODE_USERNAME) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`leetcode_stats_${username}`);
  } catch {
    // Ignore
  }
}

export const LEETCODE_USERNAME =
  import.meta.env.VITE_LEETCODE_USERNAME || personalInfo.socials.leetcodeUsername || 'GkKWasfX4F';

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

export const CODING_CATEGORIES = [
  {
    category: 'Data Structures',
    description: 'Fundamental in-memory models for efficient data organization and retrieval',
    skills: ['Arrays & Vectors', 'Linked Lists', 'Stacks & Queues', 'Hash Tables', 'Binary Trees', 'Heaps & Priority Queues']
  },
  {
    category: 'Algorithmic Paradigms',
    description: 'Core tactical patterns for solving non-trivial search and traversal problems',
    skills: ['Two Pointers', 'Sliding Window', 'Binary Search', 'Recursion & Backtracking', 'Divide & Conquer']
  },
  {
    category: 'Advanced Problem Solving',
    description: 'Complex optimization techniques and graph-theoretic approaches',
    skills: ['Dynamic Programming', 'Graph Traversal (BFS / DFS)', 'Shortest Path (Dijkstra)', 'Greedy Optimization']
  },
  {
    category: 'Engineering & Complexity',
    description: 'Rigorous implementation and asymptotic performance evaluation',
    skills: ['C++ Standard Template Library (STL)', 'Asymptotic Complexity (Big-O)', 'Bit Manipulation', 'System Constraints Evaluation']
  }
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
    return { success: true, hasStats: true, data: cached, fromCache: true };
  }

  // Attempt fetch from modern reliable LeetCode proxies or custom endpoint
  const customEndpoint = import.meta.env.VITE_LEETCODE_API_ENDPOINT;
  const apiEndpoints = [
    ...(customEndpoint ? [customEndpoint.replace('{username}', username)] : []),
    `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
    `https://leetcode-api-faisalshohag.vercel.app/${username}`
  ];

  for (const url of apiEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const json = await response.json();

      if (json && typeof json.totalSolved === 'number') {
        const stats = {
          totalSolved: json.totalSolved,
          easySolved: json.easySolved ?? 0,
          mediumSolved: json.mediumSolved ?? 0,
          hardSolved: json.hardSolved ?? 0,
          acceptanceRate: json.acceptanceRate ?? null,
          ranking: json.ranking && json.ranking <= 5000000 ? json.ranking : null,
          profileUrl: LEETCODE_PROFILE_URL
        };

        setCached(cacheKey, stats);
        return { success: true, hasStats: true, data: stats };
      }
    } catch {
      // Continue to next endpoint if this one fails/times out
    }
  }

  // Graceful fallback with verified topics & categories
  return {
    success: false,
    hasStats: false,
    profileUrl: LEETCODE_PROFILE_URL,
    topics: VERIFIED_ALGORITHMIC_TOPICS,
    categories: CODING_CATEGORIES
  };
}
