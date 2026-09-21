import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import {
  skillsData as localSkills,
  personalInfo,
  timelineData
} from '../data/portfolioData';

// Re-export Firestore domain services
export { getProjects, getProjectById } from './projectService';
export { getSkills } from './skillService';

/**
 * Fetch education records from Firestore with local fallback
 */
export async function getEducation() {
  if (!isFirebaseConfigured || !db) {
    return { data: personalInfo.education, error: null, isLive: false };
  }

  try {
    const eduRef = collection(db, COLLECTIONS.EDUCATION);
    const snapshot = await getDocs(eduRef);

    if (snapshot.empty) {
      return { data: personalInfo.education, error: null, isLive: false };
    }

    const education = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return { data: education, error: null, isLive: true };
  } catch (error) {
    console.error('[Firebase] Error fetching education:', error);
    return { data: personalInfo.education, error: error.message, isLive: false };
  }
}

/**
 * Fetch experience timeline records from Firestore with local fallback
 */
export async function getExperience() {
  if (!isFirebaseConfigured || !db) {
    return { data: timelineData.experience, error: null, isLive: false };
  }

  try {
    const expRef = collection(db, COLLECTIONS.EXPERIENCE);
    const snapshot = await getDocs(expRef);

    if (snapshot.empty) {
      return { data: timelineData.experience, error: null, isLive: false };
    }

    const experience = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return { data: experience, error: null, isLive: true };
  } catch (error) {
    console.error('[Firebase] Error fetching experience:', error);
    return { data: timelineData.experience, error: error.message, isLive: false };
  }
}

/**
 * Fetch achievements records from Firestore with local fallback
 */
export async function getAchievements() {
  if (!isFirebaseConfigured || !db) {
    return { data: timelineData.achievements, error: null, isLive: false };
  }

  try {
    const achRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
    const snapshot = await getDocs(achRef);

    if (snapshot.empty) {
      return { data: timelineData.achievements, error: null, isLive: false };
    }

    const achievements = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return { data: achievements, error: null, isLive: true };
  } catch (error) {
    console.error('[Firebase] Error fetching achievements:', error);
    return { data: timelineData.achievements, error: error.message, isLive: false };
  }
}

/**
 * Fetch certifications records from Firestore with local fallback
 */
export async function getCertifications() {
  if (!isFirebaseConfigured || !db) {
    return { data: timelineData.certifications, error: null, isLive: false };
  }

  try {
    const certRef = collection(db, COLLECTIONS.CERTIFICATIONS);
    const snapshot = await getDocs(certRef);

    if (snapshot.empty) {
      return { data: timelineData.certifications, error: null, isLive: false };
    }

    const certifications = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return { data: certifications, error: null, isLive: true };
  } catch (error) {
    console.error('[Firebase] Error fetching certifications:', error);
    return { data: timelineData.certifications, error: error.message, isLive: false };
  }
}
