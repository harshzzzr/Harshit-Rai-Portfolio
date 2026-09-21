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
