import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { projectsData as localProjects } from '../data/portfolioData';

/**
 * Standardize project object ensuring all Version 2.1 required fields are present
 */
function normalizeProject(data, id) {
  return {
    id: id || data.id || data.slug,
    slug: data.slug || data.id || id,
    title: data.title || 'Untitled Project',
    shortDescription: data.shortDescription || data.description || '',
    fullDescription: data.fullDescription || data.overview || '',
    problem: data.problem || '',
    solution: data.solution || '',
    features: Array.isArray(data.features) ? data.features : [],
    image: data.image || null,
    screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    githubUrl: data.githubUrl || null,
    liveUrl: data.liveUrl || null,
    featured: Boolean(data.featured),
    badge: data.badge || (data.featured ? 'Featured Project' : 'Project Architecture'),
    tagline: data.tagline || '',
    order: typeof data.order === 'number' ? data.order : 99,
    createdAt: data.createdAt || '2026-01-01T00:00:00.000Z',
    updatedAt: data.updatedAt || '2026-01-01T00:00:00.000Z',
  };
}

/**
 * Normalized local projects ready for fallback or Firestore seeding
 */
export const defaultProjects = localProjects.map((p, index) =>
  normalizeProject(
    {
      ...p,
      order: index + 1,
      shortDescription: p.description,
      fullDescription: p.overview,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    p.id
  )
);

/**
 * Fetch all projects from Firestore (ordered by `order` asc)
 * Falls back safely to verified default projects if Firebase is unconfigured or collection is empty
 */
export async function getProjects() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: defaultProjects,
      error: null,
      isLive: false,
    };
  }

  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    let q;
    try {
      q = query(projectsRef, orderBy('order', 'asc'));
    } catch {
      q = projectsRef;
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: defaultProjects,
        error: null,
        isLive: false,
      };
    }

    const projects = snapshot.docs.map((docSnap) =>
      normalizeProject(docSnap.data(), docSnap.id)
    );

    return {
      data: projects,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] Firestore getProjects error, using fallback:', err.message);
    return {
      data: defaultProjects,
      error: `Notice: Operating in fallback mode (${err.message})`,
      isLive: false,
    };
  }
}

/**
 * Fetch a single project by ID or slug from Firestore
 */
export async function getProjectById(projectIdOrSlug) {
  if (!projectIdOrSlug) {
    return { data: null, error: 'Project identifier is required', isLive: false };
  }

  if (!isFirebaseConfigured || !db) {
    const local = defaultProjects.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    return { data: local || null, error: null, isLive: false };
  }

  try {
    // 1. Try finding by document ID directly
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectIdOrSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        data: normalizeProject(docSnap.data(), docSnap.id),
        error: null,
        isLive: true,
      };
    }

    // 2. Query by slug field if doc ID does not match
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('slug', '==', projectIdOrSlug));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0];
      return {
        data: normalizeProject(firstDoc.data(), firstDoc.id),
        error: null,
        isLive: true,
      };
    }

    // Fall back to local project if not found in Firestore
    const local = defaultProjects.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    return { data: local || null, error: null, isLive: false };
  } catch (err) {
    console.warn(`[Firebase] Firestore getProjectById(${projectIdOrSlug}) error, using fallback:`, err.message);
    const local = defaultProjects.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    return { data: local || null, error: err.message, isLive: false };
  }
}

/**
 * Optional helper to seed Firestore projects collection if empty
 * (Safe utility for admin/dev initialization)
 */
export async function seedFirestoreProjects() {
  if (!isFirebaseConfigured || !db) {
    return { success: false, message: 'Firebase is not configured yet.' };
  }

  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const snapshot = await getDocs(projectsRef);

    if (!snapshot.empty) {
      return { success: true, message: 'Projects collection is already populated.' };
    }

    for (const project of defaultProjects) {
      const docRef = doc(db, COLLECTIONS.PROJECTS, project.id);
      await setDoc(docRef, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, message: `Successfully seeded ${defaultProjects.length} projects.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
