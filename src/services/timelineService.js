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
import { COLLECTIONS } from '../firebase/collections';
import { personalInfo, timelineData as localTimeline } from '../data/portfolioData';

/**
 * Standard Education Records Schema:
 * - id, degree, institution, status, highlights, courses, order, visible
 */
export const defaultEducation = [
  {
    id: 'edu-btech-ce',
    degree: 'Bachelor of Engineering in Computer Engineering',
    institution: 'Computer Engineering Academy / University',
    status: 'Undergraduate Student',
    highlights: [
      'Core curriculum in Computer Science & Engineering fundamentals',
      'Key focus: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks',
      'Active participant in technical problem-solving and software project tracks'
    ],
    courses: [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Object-Oriented Programming',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering & Web Systems'
    ],
    order: 1,
    visible: true,
  }
];

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

  // Hackathons
  {
    id: 'hack-1',
    type: 'hackathons',
    title: 'Engineering Hackathon Participant',
    role: 'Developer & Team Member',
    period: 'Hackathon Track',
    organization: 'Student Technical Community',
    description: 'Collaborated under rapid turnaround constraints to prototype software solutions addressing real-world problem statements.',
    order: 1,
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

  // Certifications
  {
    id: 'cert-1',
    type: 'certifications',
    title: 'Foundational Software Engineering Track',
    role: 'Certified Learner',
    period: 'Verified Coursework',
    organization: 'Technical Learning Platform',
    description: 'Completed comprehensive technical modules covering core programming, database normalization, and web fundamentals.',
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

const LOCAL_EDUCATION_KEY = 'harshit_portfolio_custom_education';
const LOCAL_TIMELINE_KEY = 'harshit_portfolio_custom_timeline';

// High-performance in-memory cache with 3-minute TTL
let memoryEduCache = null;
let memoryEduTimestamp = 0;
let memoryTimelineCache = null;
let memoryTimelineTimestamp = 0;
const TIMELINE_CACHE_TTL_MS = 3 * 60 * 1000;

export function invalidateTimelineCache() {
  memoryEduCache = null;
  memoryEduTimestamp = 0;
  memoryTimelineCache = null;
  memoryTimelineTimestamp = 0;
}

/**
 * Local storage cache helpers for Education
 */
function getStoredLocalEducation() {
  if (typeof window === 'undefined') return defaultEducation;
  try {
    const raw = localStorage.getItem(LOCAL_EDUCATION_KEY);
    if (!raw) return defaultEducation;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEducation;
  } catch {
    return defaultEducation;
  }
}

function saveStoredLocalEducation(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_EDUCATION_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[TimelineService] Failed to cache local education:', e);
  }
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
 * Fetch Education records from Firestore
 */
export async function getEducation(options = {}) {
  const { includeHidden = false } = options;

  if (!includeHidden && memoryEduCache && (Date.now() - memoryEduTimestamp < TIMELINE_CACHE_TTL_MS)) {
    return memoryEduCache;
  }

  if (!isFirebaseConfigured || !db) {
    const local = getStoredLocalEducation().sort((a, b) => (a.order || 99) - (b.order || 99));
    const filtered = includeHidden ? local : local.filter((item) => item.visible !== false);
    const result = {
      data: filtered,
      rawList: local,
      error: null,
      isLive: false,
    };
    if (!includeHidden) {
      memoryEduCache = result;
      memoryEduTimestamp = Date.now();
    }
    return result;
  }

  try {
    const eduRef = collection(db, COLLECTIONS.EDUCATION);
    let q;
    try {
      q = query(eduRef, orderBy('order', 'asc'));
    } catch {
      q = eduRef;
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const local = getStoredLocalEducation().sort((a, b) => (a.order || 99) - (b.order || 99));
      const filtered = includeHidden ? local : local.filter((item) => item.visible !== false);
      const result = {
        data: filtered,
        rawList: local,
        error: null,
        isLive: false,
      };
      if (!includeHidden) {
        memoryEduCache = result;
        memoryEduTimestamp = Date.now();
      }
      return result;
    }

    const list = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    saveStoredLocalEducation(list);

    const filtered = includeHidden ? list : list.filter((item) => item.visible !== false);

    const result = {
      data: filtered,
      rawList: list,
      error: null,
      isLive: true,
    };
    if (!includeHidden) {
      memoryEduCache = result;
      memoryEduTimestamp = Date.now();
    }
    return result;
  } catch (err) {
    console.warn('[Firebase] Firestore getEducation error, using fallback:', err.message);
    const local = getStoredLocalEducation().sort((a, b) => (a.order || 99) - (b.order || 99));
    const filtered = includeHidden ? local : local.filter((item) => item.visible !== false);
    const result = {
      data: filtered,
      rawList: local,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
    if (!includeHidden) {
      memoryEduCache = result;
      memoryEduTimestamp = Date.now();
    }
    return result;
  }
}

/**
 * CREATE Education Record
 */
export async function createEducation(eduInput) {
  const id = (eduInput.id || `edu-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newEdu = {
    id,
    degree: eduInput.degree || 'Degree Program',
    institution: eduInput.institution || 'Institution Name',
    status: eduInput.status || 'Graduated',
    highlights: Array.isArray(eduInput.highlights)
      ? eduInput.highlights
      : (typeof eduInput.highlights === 'string' ? eduInput.highlights.split('\n').map(s => s.trim()).filter(Boolean) : []),
    courses: Array.isArray(eduInput.courses)
      ? eduInput.courses
      : (typeof eduInput.courses === 'string' ? eduInput.courses.split(',').map(s => s.trim()).filter(Boolean) : []),
    order: Number(eduInput.order) || 99,
    visible: eduInput.visible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const localList = getStoredLocalEducation();
  const existingIdx = localList.findIndex((e) => e.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = newEdu;
  } else {
    localList.push(newEdu);
  }
  saveStoredLocalEducation(localList);
  invalidateTimelineCache();

  if (!isFirebaseConfigured || !db) {
    return { success: true, data: newEdu, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, id);
    await setDoc(docRef, {
      ...newEdu,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateTimelineCache();
    return { success: true, data: newEdu, isLive: true };
  } catch (err) {
    console.error('[Firebase] createEducation error:', err);
    return { success: false, error: err.message, data: newEdu };
  }
}

/**
 * UPDATE Education Record
 */
export async function updateEducation(eduId, updateData) {
  if (!eduId) return { success: false, error: 'Education ID is required' };

  const localList = getStoredLocalEducation();
  const index = localList.findIndex((e) => e.id === eduId);
  let updatedRecord = null;

  if (index >= 0) {
    updatedRecord = {
      ...localList[index],
      ...updateData,
      order: updateData.order !== undefined ? Number(updateData.order) : localList[index].order,
      visible: updateData.visible !== undefined ? Boolean(updateData.visible) : localList[index].visible,
      highlights: updateData.highlights !== undefined
        ? (Array.isArray(updateData.highlights) ? updateData.highlights : updateData.highlights.split('\n').map(s => s.trim()).filter(Boolean))
        : localList[index].highlights,
      courses: updateData.courses !== undefined
        ? (Array.isArray(updateData.courses) ? updateData.courses : updateData.courses.split(',').map(s => s.trim()).filter(Boolean))
        : localList[index].courses,
      updatedAt: new Date().toISOString(),
    };
    localList[index] = updatedRecord;
    saveStoredLocalEducation(localList);
    invalidateTimelineCache();
  }

  if (!isFirebaseConfigured || !db) {
    return { success: true, data: updatedRecord, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, eduId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    invalidateTimelineCache();
    return { success: true, data: updatedRecord, isLive: true };
  } catch (err) {
    console.error('[Firebase] updateEducation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * DELETE Education Record
 */
export async function deleteEducation(eduId) {
  if (!eduId) return { success: false, error: 'Education ID is required' };

  const localList = getStoredLocalEducation();
  const filtered = localList.filter((e) => e.id !== eduId);
  saveStoredLocalEducation(filtered);
  invalidateTimelineCache();

  if (!isFirebaseConfigured || !db) {
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, eduId);
    await deleteDoc(docRef);
    invalidateTimelineCache();
    return { success: true, isLive: true };
  } catch (err) {
    console.error('[Firebase] deleteEducation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Education Visibility
 */
export async function toggleEducationVisibility(eduId, currentVisible) {
  return updateEducation(eduId, { visible: !currentVisible });
}

/**
 * Fetch all Timeline records (Experience, Hackathons, Research, Achievements, Certifications)
 */
export async function getTimelineData(options = {}) {
  const { includeHidden = false } = options;

  if (!includeHidden && memoryTimelineCache && (Date.now() - memoryTimelineTimestamp < TIMELINE_CACHE_TTL_MS)) {
    return memoryTimelineCache;
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
    if (!includeHidden) {
      memoryTimelineCache = result;
      memoryTimelineTimestamp = Date.now();
    }
    return result;
  }

  try {
    const timelineRef = collection(db, 'timeline');
    let snapshot = await getDocs(timelineRef);

    if (snapshot.empty) {
      const expRef = collection(db, COLLECTIONS.EXPERIENCE);
      snapshot = await getDocs(expRef);
    }

    if (snapshot.empty) {
      const local = getStoredLocalTimeline().sort((a, b) => (a.order || 99) - (b.order || 99));
      const items = includeHidden ? local : local.filter((item) => item.visible !== false);
      const result = {
        data: groupTimelineByType(items),
        rawList: local,
        error: null,
        isLive: false,
      };
      if (!includeHidden) {
        memoryTimelineCache = result;
        memoryTimelineTimestamp = Date.now();
      }
      return result;
    }

    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })).sort((a, b) => (a.order || 99) - (b.order || 99));

    saveStoredLocalTimeline(items);

    const filtered = includeHidden ? items : items.filter((item) => item.visible !== false);

    const result = {
      data: groupTimelineByType(filtered),
      rawList: items,
      error: null,
      isLive: true,
    };
    if (!includeHidden) {
      memoryTimelineCache = result;
      memoryTimelineTimestamp = Date.now();
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
    if (!includeHidden) {
      memoryTimelineCache = result;
      memoryTimelineTimestamp = Date.now();
    }
    return result;
  }
}

/**
 * CREATE Timeline Item (Experience, Hackathons, Research, Achievements, Certifications)
 */
export async function createTimelineItem(itemInput) {
  const id = (itemInput.id || `${itemInput.type || 'timeline'}-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newItem = {
    id,
    type: itemInput.type || 'experience',
    title: itemInput.title || 'Untitled Milestone',
    role: itemInput.role || '',
    period: itemInput.period || '',
    organization: itemInput.organization || '',
    description: itemInput.description || '',
    order: Number(itemInput.order) || 99,
    visible: itemInput.visible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const localList = getStoredLocalTimeline();
  const existingIdx = localList.findIndex((i) => i.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = newItem;
  } else {
    localList.push(newItem);
  }
  saveStoredLocalTimeline(localList);
  invalidateTimelineCache();

  if (!isFirebaseConfigured || !db) {
    return { success: true, data: newItem, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', id);
    await setDoc(docRef, {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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

  if (!isFirebaseConfigured || !db) {
    return { success: true, data: updatedItem, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', itemId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
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

  const localList = getStoredLocalTimeline();
  const filtered = localList.filter((i) => i.id !== itemId);
  saveStoredLocalTimeline(filtered);
  invalidateTimelineCache();

  if (!isFirebaseConfigured || !db) {
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, 'timeline', itemId);
    await deleteDoc(docRef);
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
 * Seed Firestore education collection if empty
 */
export async function seedFirestoreEducation() {
  if (!isFirebaseConfigured || !db) return { success: false, message: 'Firebase unconfigured' };
  try {
    for (const edu of defaultEducation) {
      await setDoc(doc(db, COLLECTIONS.EDUCATION, edu.id), edu);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
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

