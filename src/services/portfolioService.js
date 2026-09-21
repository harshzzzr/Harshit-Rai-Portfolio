/**
 * Centralized Portfolio Service Layer
 * Re-exports domain services for projects, skills, education, and timeline
 */
export { getProjects, getProjectById, seedFirestoreProjects } from './projectService';
export { getSkills, seedFirestoreSkills } from './skillService';
export {
  getEducation,
  getTimelineData,
  seedFirestoreEducation,
  seedFirestoreTimeline
} from './timelineService';
export {
  submitContactMessage,
  getMessages,
  getMessageCount,
  updateMessageStatus,
  deleteMessage
} from './messageService';
export {
  submitFeedback,
  getApprovedFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  approveFeedback,
  rejectFeedback,
  toggleFeaturedFeedback,
  deleteFeedback
} from './feedbackService';
export {
  fetchGitHubProfile,
  fetchGitHubRepos,
  clearGitHubCache,
  getLanguageColor,
  GITHUB_LANG_COLORS,
  GITHUB_USERNAME,
  GITHUB_PROFILE_URL
} from './githubService';
export {
  fetchLeetCodeStats,
  clearLeetCodeCache,
  CODING_CATEGORIES,
  VERIFIED_ALGORITHMIC_TOPICS,
  LEETCODE_USERNAME,
  LEETCODE_PROFILE_URL
} from './leetcodeService';
export {
  getCurrentlyPlaying,
  CODING_SOUNDTRACKS,
  SPOTIFY_USERNAME,
  SPOTIFY_PROFILE_URL
} from './spotifyService';


