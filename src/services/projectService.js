import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { projectsData as localProjects } from '../data/portfolioData';
import { uploadAsset, STORAGE_PATHS } from './storageService';

const LOCAL_PROJECTS_KEY = 'harshit_portfolio_custom_projects';

// High-performance in-memory cache with 3-minute TTL
let memoryProjectsCache = null;
let memoryProjectsTimestamp = 0;
const PROJECTS_CACHE_TTL_MS = 3 * 60 * 1000;

export function invalidateProjectsCache() {
  memoryProjectsCache = null;
  memoryProjectsTimestamp = 0;
}

/**
 * Standardize project object ensuring all Version 3.2 required fields are present
 */
export function normalizeProject(data, id) {
  const finalId = id || data.id || data.slug || `proj-${Date.now()}`;
  return {
    id: finalId,
    slug: data.slug || data.id || finalId,
    title: data.title || 'Untitled Project',
    shortDescription: data.shortDescription || data.description || '',
    fullDescription: data.fullDescription || data.overview || '',
    problem: data.problem || '',
    solution: data.solution || '',
    features: Array.isArray(data.features)
      ? data.features
      : (typeof data.features === 'string' ? data.features.split('\n').map(s => s.trim()).filter(Boolean) : []),
    image: data.image || null,
    screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
    technologies: Array.isArray(data.technologies)
      ? data.technologies
      : (typeof data.technologies === 'string' ? data.technologies.split(',').map(s => s.trim()).filter(Boolean) : []),
    githubUrl: data.githubUrl || null,
    liveUrl: data.liveUrl || null,
    featured: Boolean(data.featured),
    visible: data.visible !== false,
    badge: data.badge || (data.featured ? 'Featured Project' : 'Project Architecture'),
    tagline: data.tagline || '',
    order: typeof data.order === 'number' ? data.order : 99,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Baseline normalized projects from local static data
 */
export const defaultProjects = localProjects.map((p, index) =>
  normalizeProject(
    {
      ...p,
      order: index + 1,
      visible: true,
      shortDescription: p.description,
      fullDescription: p.overview,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    p.id
  )
);

/**
 * Get cached local / demo projects
 */
function getStoredLocalProjects() {
  if (typeof window === 'undefined') return defaultProjects;
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return defaultProjects;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

/**
 * Save cached local / demo projects
 */
function saveStoredLocalProjects(projects) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('[ProjectService] Failed to cache local projects:', e);
  }
}

/**
 * Fetch all projects from Firestore (ordered by `order` asc)
 * Supports { includeHidden = false } to strictly protect drafts from public view
 */
export async function getProjects(options = {}) {
  const { includeHidden = false } = options;

  // Check fast in-memory cache first
  if (memoryProjectsCache && (Date.now() - memoryProjectsTimestamp < PROJECTS_CACHE_TTL_MS)) {
    const cachedList = includeHidden ? memoryProjectsCache : memoryProjectsCache.filter((p) => p.visible !== false);
    return {
      data: cachedList,
      error: null,
      isLive: Boolean(isFirebaseConfigured && db),
    };
  }

  if (!isFirebaseConfigured || !db) {
    const local = getStoredLocalProjects().sort((a, b) => (a.order || 99) - (b.order || 99));
    const filtered = includeHidden ? local : local.filter((p) => p.visible !== false);
    if (includeHidden) {
      memoryProjectsCache = local;
      memoryProjectsTimestamp = Date.now();
    }
    return {
      data: filtered,
      error: null,
      isLive: false,
    };
  }

  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    let q;
    if (!includeHidden) {
      // Must query where('visible', '==', true) to match firestore.rules public read security
      q = query(projectsRef, where('visible', '==', true));
    } else {
      q = projectsRef;
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: [],
        error: null,
        isLive: true,
      };
    }

    const projects = snapshot.docs
      .map((docSnap) => normalizeProject(docSnap.data(), docSnap.id))
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    if (includeHidden) {
      // Keep memory and local storage synced with full dataset
      memoryProjectsCache = projects;
      memoryProjectsTimestamp = Date.now();
      saveStoredLocalProjects(projects);
    }

    const finalResult = includeHidden ? projects : projects.filter((p) => p.visible !== false);

    return {
      data: finalResult,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] Firestore getProjects error, using fallback:', err.message);
    const local = getStoredLocalProjects().sort((a, b) => (a.order || 99) - (b.order || 99));
    const filtered = includeHidden ? local : local.filter((p) => p.visible !== false);
    return {
      data: filtered,
      error: `Notice: Operating in fallback mode (${err.message})`,
      isLive: false,
    };
  }
}

/**
 * Fetch a single project by ID or slug
 * Returns not-found error if project is marked visible: false and includeHidden is false
 */
export async function getProjectById(projectIdOrSlug, options = {}) {
  const { includeHidden = false } = options;

  if (!projectIdOrSlug) {
    return { data: null, error: 'Project identifier is required', isLive: false };
  }

  // Fast memory lookup
  if (memoryProjectsCache) {
    const found = memoryProjectsCache.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    if (found) {
      if (!includeHidden && found.visible === false) {
        return { data: null, error: 'Project not found', isLive: Boolean(isFirebaseConfigured && db) };
      }
      return { data: found, error: null, isLive: Boolean(isFirebaseConfigured && db) };
    }
  }

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalProjects();
    const local = localList.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    if (local && !includeHidden && local.visible === false) {
      return { data: null, error: 'Project not found', isLive: false };
    }
    return { data: local || null, error: local ? null : 'Project not found', isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectIdOrSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const project = normalizeProject(docSnap.data(), docSnap.id);
      if (!includeHidden && project.visible === false) {
        return { data: null, error: 'Project not found', isLive: true };
      }
      return {
        data: project,
        error: null,
        isLive: true,
      };
    }

    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    let q;
    if (!includeHidden) {
      q = query(projectsRef, where('slug', '==', projectIdOrSlug), where('visible', '==', true));
    } else {
      q = query(projectsRef, where('slug', '==', projectIdOrSlug));
    }
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0];
      const project = normalizeProject(firstDoc.data(), firstDoc.id);
      if (!includeHidden && project.visible === false) {
        return { data: null, error: 'Project not found', isLive: true };
      }
      return {
        data: project,
        error: null,
        isLive: true,
      };
    }

    return { data: null, error: 'Project not found', isLive: true };
  } catch (err) {
    console.warn(`[Firebase] Firestore getProjectById(${projectIdOrSlug}) error, using fallback:`, err.message);
    const localList = getStoredLocalProjects();
    const local = localList.find(
      (p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug
    );
    if (local && !includeHidden && local.visible === false) {
      return { data: null, error: 'Project not found', isLive: false };
    }
    return { data: local || null, error: err.message, isLive: false };
  }
}

/**
 * CREATE a new project in Firestore (with local persistence fallback)
 */
export async function createProject(projectInput) {
  const id = (projectInput.id || projectInput.slug || projectInput.title || `proj-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const normalized = normalizeProject(
    {
      ...projectInput,
      id,
      slug: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    id
  );

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalProjects();
    const existingIdx = localList.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = normalized;
    } else {
      localList.push(normalized);
    }
    saveStoredLocalProjects(localList);
    invalidateProjectsCache();

    return {
      success: true,
      data: normalized,
      isLive: false,
      message: 'Project created successfully in local cache (Firebase unconfigured).',
    };
  }

  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await setDoc(docRef, {
      ...normalized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalProjects();
    const existingIdx = localList.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = normalized;
    } else {
      localList.push(normalized);
    }
    saveStoredLocalProjects(localList);
    invalidateProjectsCache();

    return {
      success: true,
      data: normalized,
      isLive: true,
      message: 'Project created successfully in Cloud Firestore.',
    };
  } catch (err) {
    console.error('[Firebase] createProject error:', err);
    return {
      success: false,
      error: err.message,
      data: normalized,
    };
  }
}

/**
 * UPDATE an existing project in Firestore (with local persistence fallback)
 */
export async function updateProject(projectId, updateData) {
  if (!projectId) {
    return { success: false, error: 'Project ID is required' };
  }

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalProjects();
    const existingIdx = localList.findIndex((p) => p.id === projectId || p.slug === projectId);
    let updatedRecord = null;

    if (existingIdx >= 0) {
      updatedRecord = normalizeProject(
        {
          ...localList[existingIdx],
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
        localList[existingIdx].id
      );
      localList[existingIdx] = updatedRecord;
      saveStoredLocalProjects(localList);
      invalidateProjectsCache();
    }

    return {
      success: true,
      data: updatedRecord,
      isLive: false,
      message: 'Project updated in local cache.',
    };
  }

  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalProjects();
    const existingIdx = localList.findIndex((p) => p.id === projectId || p.slug === projectId);
    let updatedRecord = null;
    if (existingIdx >= 0) {
      updatedRecord = normalizeProject(
        {
          ...localList[existingIdx],
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
        localList[existingIdx].id
      );
      localList[existingIdx] = updatedRecord;
      saveStoredLocalProjects(localList);
    }
    invalidateProjectsCache();

    return {
      success: true,
      data: updatedRecord,
      isLive: true,
      message: 'Project updated successfully in Cloud Firestore.',
    };
  } catch (err) {
    console.error('[Firebase] updateProject error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * DELETE a project from Firestore (with local persistence fallback)
 */
export async function deleteProject(projectId) {
  if (!projectId) {
    return { success: false, error: 'Project ID is required' };
  }

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalProjects();
    const filtered = localList.filter((p) => p.id !== projectId && p.slug !== projectId);
    saveStoredLocalProjects(filtered);
    invalidateProjectsCache();

    return {
      success: true,
      isLive: false,
      message: 'Project deleted from local cache.',
    };
  }

  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(docRef);

    const localList = getStoredLocalProjects();
    const filtered = localList.filter((p) => p.id !== projectId && p.slug !== projectId);
    saveStoredLocalProjects(filtered);
    invalidateProjectsCache();

    return {
      success: true,
      isLive: true,
      message: 'Project deleted from Cloud Firestore.',
    };
  } catch (err) {
    console.error('[Firebase] deleteProject error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Quick toggle featured status
 */
export async function toggleProjectFeatured(projectId, currentStatus) {
  return updateProject(projectId, { featured: !currentStatus });
}

/**
 * Quick toggle visibility status (published vs draft)
 */
export async function toggleProjectVisibility(projectId, currentStatus) {
  return updateProject(projectId, { visible: !currentStatus });
}

/**
 * Upload project image asset via Firebase Storage
 */
export async function uploadProjectImage(file, projectId) {
  const safeId = projectId || 'temp';
  const originalExt = (file.name && file.name.split('.').pop()) || 'png';
  const destination = `${STORAGE_PATHS.PROJECTS}/${safeId}_${Date.now()}.${originalExt}`;
  return uploadAsset(file, destination, { optimize: true });
}

/**
 * Seed Firestore projects collection if empty
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
