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

/**
 * Standard Education Records Schema:
 * - id, degree, institution, status, highlights, courses, order, visible
 */
export const defaultEducation = [
  {
    id: 'edu-btech-ce',
    degree: 'Bachelor of Engineering in Computer Engineering',
    institution: 'Computer Engineering Department',
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

const LOCAL_EDUCATION_KEY = 'harshit_portfolio_custom_education';
const EDU_CACHE_TTL_MS = 3 * 60 * 1000;

let memoryEduPublic = null;
let memoryEduAdmin = null;
let memoryEduPublicTime = 0;
let memoryEduAdminTime = 0;

export function invalidateEducationCache() {
  memoryEduPublic = null;
  memoryEduAdmin = null;
  memoryEduPublicTime = 0;
  memoryEduAdminTime = 0;
}

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
    console.warn('[EducationService] Failed to cache local education:', e);
  }
}

/**
 * Fetch Education records from Firestore
 */
export async function getEducation(options = {}) {
  const { includeHidden = false } = options;
  const now = Date.now();

  if (includeHidden) {
    if (memoryEduAdmin && now - memoryEduAdminTime < EDU_CACHE_TTL_MS) {
      return memoryEduAdmin;
    }
  } else {
    if (memoryEduPublic && now - memoryEduPublicTime < EDU_CACHE_TTL_MS) {
      return memoryEduPublic;
    }
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
    if (includeHidden) {
      memoryEduAdmin = result;
      memoryEduAdminTime = now;
    } else {
      memoryEduPublic = result;
      memoryEduPublicTime = now;
    }
    return result;
  }

  try {
    const eduRef = collection(db, COLLECTIONS.EDUCATION);
    let q;
    if (includeHidden) {
      try {
        q = query(eduRef, orderBy('order', 'asc'));
      } catch {
        q = eduRef;
      }
    } else {
      try {
        q = query(eduRef, where('visible', '==', true), orderBy('order', 'asc'));
      } catch {
        q = query(eduRef, where('visible', '==', true));
      }
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const result = {
        data: [],
        rawList: [],
        error: null,
        isLive: true,
      };
      if (includeHidden) {
        memoryEduAdmin = result;
        memoryEduAdminTime = now;
      } else {
        memoryEduPublic = result;
        memoryEduPublicTime = now;
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
      saveStoredLocalEducation(list);
    }

    const filtered = includeHidden ? list : list.filter((item) => item.visible !== false);

    const result = {
      data: filtered,
      rawList: list,
      error: null,
      isLive: true,
    };
    if (includeHidden) {
      memoryEduAdmin = result;
      memoryEduAdminTime = now;
    } else {
      memoryEduPublic = result;
      memoryEduPublicTime = now;
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
    if (includeHidden) {
      memoryEduAdmin = result;
      memoryEduAdminTime = now;
    } else {
      memoryEduPublic = result;
      memoryEduPublicTime = now;
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

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalEducation();
    const existingIdx = localList.findIndex((e) => e.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newEdu;
    } else {
      localList.push(newEdu);
    }
    saveStoredLocalEducation(localList);
    invalidateEducationCache();
    return { success: true, data: newEdu, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, id);
    await setDoc(docRef, {
      ...newEdu,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalEducation();
    const existingIdx = localList.findIndex((e) => e.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newEdu;
    } else {
      localList.push(newEdu);
    }
    saveStoredLocalEducation(localList);
    invalidateEducationCache();

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

  if (!isFirebaseConfigured || !db) {
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
      invalidateEducationCache();
    }
    return { success: true, data: updatedRecord, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, eduId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

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
    }
    invalidateEducationCache();

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

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalEducation();
    const filtered = localList.filter((e) => e.id !== eduId);
    saveStoredLocalEducation(filtered);
    invalidateEducationCache();
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.EDUCATION, eduId);
    await deleteDoc(docRef);

    const localList = getStoredLocalEducation();
    const filtered = localList.filter((e) => e.id !== eduId);
    saveStoredLocalEducation(filtered);
    invalidateEducationCache();

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
