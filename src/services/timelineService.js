import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// Re-export education domain methods for clean modular backwards compatibility
export {
  defaultEducation,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  toggleEducationVisibility,
  seedFirestoreEducation,
  invalidateEducationCache
} from './educationService';

/**
 * Unified Timeline / Experience Records Schema:
 * - id, type ('experience' | 'hackathons' | 'research' | 'achievements' | 'certifications')
 * - title, role, period, organization, description, order, visible
 */
export const defaultTimelineItems = [
  // Experience
  {
    id: 'exp-1',
    type: 'experience',
    title: 'Computer Engineering Developer Track',
    role: 'Student Developer',
    period: 'Academic Trajectory',
    organization: 'Engineering Department',
    description: 'Engaged in hands-on software development laboratories, algorithm design, system architecture analysis, and collaborative code reviews.',
    order: 1,
    visible: true,
  },
  {
    id: 'exp-2',
    type: 'experience',
    title: 'Open Source & Independent Projects',
    role: 'Contributor & Builder',
    period: 'Continuous',
    organization: 'Independent',
    description: 'Building tools, experimenting with full-stack web stacks, microcontrollers, and modern framework architectures.',
    order: 2,
    visible: true,
  },

  // Research
  {
    id: 'res-1',
    type: 'research',
    title: 'Systems & Computing Exploration',
    role: 'Academic Inquiry',
    period: 'Undergraduate Coursework',
    organization: 'Academic Laboratory',
    description: 'Investigating relational query optimization, distributed data structures, and microcontroller sensor interfacing.',
    order: 1,
    visible: true,
  },

  // Achievements
  {
    id: 'ach-1',
    type: 'achievements',
    title: 'Algorithmic Problem Solving Milestones',
    role: 'Problem Solver',
    period: 'Active Practice',
    organization: 'Competitive Programming Tracks',
    description: 'Consistently practicing core algorithmic topics, data structures, and computational optimization in C++ and Java.',
    order: 1,
    visible: true,
  },
];

/**
 * Group flat timeline items by type into structured object
 */
export function groupTimelineByType(items) {
  const grouped = {
    experience: [],
    hackathons: [],
    research: [],
    achievements: [],
    certifications: []
  };

  items
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .forEach((item) => {
      const t = item.type || 'experience';
      if (grouped[t]) {
        grouped[t].push(item);
      }
    });

  return grouped;
}

const LOCAL_TIMELINE_KEY = 'harshit_portfolio_custom_timeline';
const TIMELINE_CACHE_TTL_MS = 3 * 60 * 1000;

let memoryTimelinePublic = null;
let memoryTimelineAdmin = null;
let memoryTimelinePublicTime = 0;
let memoryTimelineAdminTime = 0;

export function invalidateTimelineCache() {
  memoryTimelinePublic = null;
  memoryTimelineAdmin = null;
  memoryTimelinePublicTime = 0;
  memoryTimelineAdminTime = 0;
}

/**
 * Local storage cache helpers for Timeline Items
 */
function getStoredLocalTimeline() {
  if (typeof window === 'undefined') return defaultTimelineItems;
  try {
    const raw = localStorage.getItem(LOCAL_TIMELINE_KEY);
    if (!raw) return defaultTimelineItems;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTimelineItems;
  } catch {
    return defaultTimelineItems;
  }
}

function saveStoredLocalTimeline(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_TIMELINE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[TimelineService] Failed to cache local timeline:', e);
  }
}

/**
 * Fetch all Timeline records (Experience, Hackathons, Research, Achievements, Certifications)
 */
export async function getTimelineData(options = {}) {
  const { includeHidden = false } = options;
  const now = Date.now();

  if (includeHidden) {
    if (memoryTimelineAdmin && now - memoryTimelineAdminTime < TIMELINE_CACHE_TTL_MS) {
      return memoryTimelineAdmin;
    }
  } else {
    if (memoryTimelinePublic && now - memoryTimelinePublicTime < TIMELINE_CACHE_TTL_MS) {
      return memoryTimelinePublic;
    }
  }

  if (!isFirebaseConfigured || !db) {
    const local = getStoredLocalTimeline().sort((a, b) => (a.order || 99) - (b.order || 99));
    const items = includeHidden ? local : local.filter((item) => item.visible !== false);
    const result = {
      data: groupTimelineByType(items),
      rawList: local,
      error: null,
      isLive: false,
    };
    if (includeHidden) {
      memoryTimelineAdmin = result;
      memoryTimelineAdminTime = now;
    } else {
      memoryTimelinePublic = result;
      memoryTimelinePublicTime = now;
    }
    return result;
  }

  try {
    const timelineRef = collection(db, 'timeline');
    let q;
    if (includeHidden) {
      try {
        q = query(timelineRef, orderBy('order', 'asc'));
      } catch {
        q = timelineRef;
      }
    } else {
      try {
        q = query(timelineRef, where('visible', '==', true), orderBy('order', 'asc'));
      } catch {
        q = query(timelineRef, where('visible', '==', true));
      }
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const result = {
        data: {
          experience: [],
          hackathons: [],
          research: [],
          achievements: [],
          certifications: []
        },
        rawList: [],
        error: null,
        isLive: true,
      };
      if (includeHidden) {
        memoryTimelineAdmin = result;
        memoryTimelineAdminTime = now;
      } else {
        memoryTimelinePublic = result;
        memoryTimelinePublicTime = now;
      }
      return result;
    }

    const list = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        visible: docSnap.data().visible !== false,
        ...docSnap.data(),
      }))
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    if (includeHidden) {
      saveStoredLocalTimeline(list);
    }

    const filtered = includeHidden ? list : list.filter((item) => item.visible !== false);

    const result = {
      data: groupTimelineByType(filtered),
      rawList: list,
      error: null,
      isLive: true,
    };
    if (includeHidden) {
      memoryTimelineAdmin = result;
      memoryTimelineAdminTime = now;
    } else {
      memoryTimelinePublic = result;
      memoryTimelinePublicTime = now;
    }
    return result;
  } catch (err) {
    console.warn('[Firebase] Firestore getTimelineData error, using fallback:', err.message);
    const local = getStoredLocalTimeline().sort((a, b) => (a.order || 99) - (b.order || 99));
    const items = includeHidden ? local : local.filter((item) => item.visible !== false);
    const result = {
      data: groupTimelineByType(items),
      rawList: local,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
    if (includeHidden) {
      memoryTimelineAdmin = result;
      memoryTimelineAdminTime = now;
    } else {
      memoryTimelinePublic = result;
      memoryTimelinePublicTime = now;
    }
    return result;
  }
}

/**
 * CREATE Timeline Item
 */
export async function createTimelineItem(itemInput) {
  const id = (itemInput.id || `timeline-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newItem = {
    id,
    type: itemInput.type || 'experience',
    title: itemInput.title || 'Title',
    role: itemInput.role || '',
    period: itemInput.period || '',
    organization: itemInput.organization || '',
    description: itemInput.description || '',
    order: Number(itemInput.order) || 99,
    visible: itemInput.visible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalTimeline();
    const existingIdx = localList.findIndex((i) => i.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newItem;
    } else {
      localList.push(newItem);
    }
    saveStoredLocalTimeline(localList);
    invalidateTimelineCache();
    return { success: true, data: newItem, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', id);
    await setDoc(docRef, {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalTimeline();
    const existingIdx = localList.findIndex((i) => i.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newItem;
    } else {
      localList.push(newItem);
    }
    saveStoredLocalTimeline(localList);
    invalidateTimelineCache();

    return { success: true, data: newItem, isLive: true };
  } catch (err) {
    console.error('[Firebase] createTimelineItem error:', err);
    return { success: false, error: err.message, data: newItem };
  }
}

/**
 * UPDATE Timeline Item
 */
export async function updateTimelineItem(itemId, updateData) {
  if (!itemId) return { success: false, error: 'Timeline Item ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalTimeline();
    const index = localList.findIndex((i) => i.id === itemId);
    let updatedItem = null;

    if (index >= 0) {
      updatedItem = {
        ...localList[index],
        ...updateData,
        order: updateData.order !== undefined ? Number(updateData.order) : localList[index].order,
        visible: updateData.visible !== undefined ? Boolean(updateData.visible) : localList[index].visible,
        updatedAt: new Date().toISOString(),
      };
      localList[index] = updatedItem;
      saveStoredLocalTimeline(localList);
      invalidateTimelineCache();
    }
    return { success: true, data: updatedItem, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', itemId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalTimeline();
    const index = localList.findIndex((i) => i.id === itemId);
    let updatedItem = null;
    if (index >= 0) {
      updatedItem = {
        ...localList[index],
        ...updateData,
        order: updateData.order !== undefined ? Number(updateData.order) : localList[index].order,
        visible: updateData.visible !== undefined ? Boolean(updateData.visible) : localList[index].visible,
        updatedAt: new Date().toISOString(),
      };
      localList[index] = updatedItem;
      saveStoredLocalTimeline(localList);
    }
    invalidateTimelineCache();

    return { success: true, data: updatedItem, isLive: true };
  } catch (err) {
    console.error('[Firebase] updateTimelineItem error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * DELETE Timeline Item
 */
export async function deleteTimelineItem(itemId) {
  if (!itemId) return { success: false, error: 'Timeline Item ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalTimeline();
    const filtered = localList.filter((i) => i.id !== itemId);
    saveStoredLocalTimeline(filtered);
    invalidateTimelineCache();
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', itemId);
    await deleteDoc(docRef);

    const localList = getStoredLocalTimeline();
    const filtered = localList.filter((i) => i.id !== itemId);
    saveStoredLocalTimeline(filtered);
    invalidateTimelineCache();

    return { success: true, isLive: true };
  } catch (err) {
    console.error('[Firebase] deleteTimelineItem error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Timeline Item Visibility
 */
export async function toggleTimelineItemVisibility(itemId, currentVisible) {
  return updateTimelineItem(itemId, { visible: !currentVisible });
}

/**
 * Seed Firestore timeline collection if empty
 */
export async function seedFirestoreTimeline() {
  if (!isFirebaseConfigured || !db) return { success: false, message: 'Firebase unconfigured' };
  try {
    for (const item of defaultTimelineItems) {
      await setDoc(doc(db, 'timeline', item.id), item);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
