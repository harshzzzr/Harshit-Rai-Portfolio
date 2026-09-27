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
 * Verified base skills with Version 2.2 schema:
 * - name, category, icon, order, visible
 */
export const defaultSkillsList = [
  // Programming
  { id: 'skill-cpp', name: 'C++', category: 'Programming', icon: 'Code', order: 1, visible: true },
  { id: 'skill-python', name: 'Python', category: 'Programming', icon: 'Code', order: 2, visible: true },
  { id: 'skill-java', name: 'Java', category: 'Programming', icon: 'Code', order: 3, visible: true },
  { id: 'skill-javascript', name: 'JavaScript', category: 'Programming', icon: 'Code', order: 4, visible: true },
  { id: 'skill-sql', name: 'SQL', category: 'Programming', icon: 'Code', order: 5, visible: true },

  // Web Development
  { id: 'skill-html', name: 'HTML', category: 'Web Development', icon: 'Globe', order: 6, visible: true },
  { id: 'skill-css', name: 'CSS', category: 'Web Development', icon: 'Globe', order: 7, visible: true },
  { id: 'skill-nodejs', name: 'Node.js', category: 'Web Development', icon: 'Globe', order: 8, visible: true },
  { id: 'skill-express', name: 'Express', category: 'Web Development', icon: 'Globe', order: 9, visible: true },
  { id: 'skill-angular', name: 'Angular', category: 'Web Development', icon: 'Globe', order: 10, visible: true },

  // Database
  { id: 'skill-mysql', name: 'MySQL', category: 'Database', icon: 'Database', order: 11, visible: true },
  { id: 'skill-mongodb', name: 'MongoDB', category: 'Database', icon: 'Database', order: 12, visible: true },
  { id: 'skill-firebase', name: 'Firebase', category: 'Database', icon: 'Database', order: 13, visible: true },

  // Tools
  { id: 'skill-git', name: 'Git', category: 'Tools', icon: 'Wrench', order: 14, visible: true },
  { id: 'skill-github', name: 'GitHub', category: 'Tools', icon: 'Wrench', order: 15, visible: true },

  // Mobile
  { id: 'skill-android', name: 'Android', category: 'Mobile', icon: 'Smartphone', order: 16, visible: true },

  // Other
  { id: 'skill-arduino', name: 'Arduino', category: 'Other', icon: 'Cpu', order: 17, visible: true },
  { id: 'skill-unity', name: 'Unity', category: 'Other', icon: 'Layers', order: 18, visible: true }
];

const LOCAL_SKILLS_KEY = 'harshit_portfolio_custom_skills';

// High-performance in-memory caches with 3-minute TTL
let memorySkillsPublic = null;
let memorySkillsAdmin = null;
let memorySkillsPublicTime = 0;
let memorySkillsAdminTime = 0;
const SKILLS_CACHE_TTL_MS = 3 * 60 * 1000;

export function invalidateSkillsCache() {
  memorySkillsPublic = null;
  memorySkillsAdmin = null;
  memorySkillsPublicTime = 0;
  memorySkillsAdminTime = 0;
}

/**
 * Get stored local skills from localStorage
 */
function getStoredLocalSkills() {
  if (typeof window === 'undefined') return defaultSkillsList;
  try {
    const raw = localStorage.getItem(LOCAL_SKILLS_KEY);
    if (!raw) return defaultSkillsList;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSkillsList;
  } catch {
    return defaultSkillsList;
  }
}

/**
 * Save stored local skills to localStorage
 */
function saveStoredLocalSkills(skills) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SKILLS_KEY, JSON.stringify(skills));
  } catch (e) {
    console.warn('[SkillService] Failed to cache local skills:', e);
  }
}

/**
 * Groups flat skill array into ordered categories
 */
export function groupSkillsByCategory(skillsArray) {
  const categoryOrder = [
    'Programming',
    'Web Development',
    'Database',
    'Tools',
    'Mobile',
    'Other'
  ];

  const groupedMap = new Map();
  categoryOrder.forEach((cat) => groupedMap.set(cat, []));

  skillsArray
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .forEach((skill) => {
      const cat = skill.category || 'Other';
      if (!groupedMap.has(cat)) {
        groupedMap.set(cat, []);
      }
      groupedMap.get(cat).push(skill);
    });

  // Return only non-empty categories in standard order
  return Array.from(groupedMap.entries())
    .filter(([_, list]) => list.length > 0)
    .map(([category, skills]) => ({
      category,
      skills,
    }));
}

/**
 * Fetch all skills from Firestore
 * Returns { data, rawList, error, isLive }
 */
export async function getSkills({ includeHidden = false } = {}) {
  const now = Date.now();
  if (includeHidden) {
    if (memorySkillsAdmin && (now - memorySkillsAdminTime < SKILLS_CACHE_TTL_MS)) {
      return memorySkillsAdmin;
    }
  } else {
    if (memorySkillsPublic && (now - memorySkillsPublicTime < SKILLS_CACHE_TTL_MS)) {
      return memorySkillsPublic;
    }
  }

  if (!isFirebaseConfigured || !db) {
    let local = getStoredLocalSkills().sort((a, b) => (a.order || 99) - (b.order || 99));
    if (!includeHidden) {
      local = local.filter((s) => s.visible !== false);
    }
    const result = {
      data: groupSkillsByCategory(local),
      rawList: local,
      error: null,
      isLive: false,
    };
    if (includeHidden) {
      memorySkillsAdmin = result;
      memorySkillsAdminTime = now;
    } else {
      memorySkillsPublic = result;
      memorySkillsPublicTime = now;
    }
    return result;
  }

  try {
    const skillsRef = collection(db, COLLECTIONS.SKILLS);
    let q;
    if (includeHidden) {
      try {
        q = query(skillsRef, orderBy('order', 'asc'));
      } catch {
        q = skillsRef;
      }
    } else {
      try {
        q = query(skillsRef, where('visible', '==', true), orderBy('order', 'asc'));
      } catch {
        q = query(skillsRef, where('visible', '==', true));
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
        memorySkillsAdmin = result;
        memorySkillsAdminTime = now;
      } else {
        memorySkillsPublic = result;
        memorySkillsPublicTime = now;
      }
      return result;
    }

    let skills = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || '',
      category: docSnap.data().category || 'Other',
      icon: docSnap.data().icon || 'Code',
      order: typeof docSnap.data().order === 'number' ? docSnap.data().order : 99,
      visible: docSnap.data().visible !== false,
      ...docSnap.data()
    })).sort((a, b) => (a.order || 99) - (b.order || 99));

    if (!includeHidden) {
      skills = skills.filter((s) => s.visible !== false);
    }

    if (includeHidden) {
      saveStoredLocalSkills(skills);
    }

    const result = {
      data: groupSkillsByCategory(skills),
      rawList: skills,
      error: null,
      isLive: true,
    };
    if (includeHidden) {
      memorySkillsAdmin = result;
      memorySkillsAdminTime = now;
    } else {
      memorySkillsPublic = result;
      memorySkillsPublicTime = now;
    }
    return result;
  } catch (err) {
    console.warn('[Firebase] Firestore getSkills error, using fallback:', err.message);
    let local = getStoredLocalSkills().sort((a, b) => (a.order || 99) - (b.order || 99));
    if (!includeHidden) {
      local = local.filter((s) => s.visible !== false);
    }
    const result = {
      data: groupSkillsByCategory(local),
      rawList: local,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
    if (includeHidden) {
      memorySkillsAdmin = result;
      memorySkillsAdminTime = now;
    } else {
      memorySkillsPublic = result;
      memorySkillsPublicTime = now;
    }
    return result;
  }
}

/**
 * CREATE a new skill
 */
export async function createSkill(skillInput) {
  const id = (skillInput.id || `skill-${skillInput.name || Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newSkill = {
    id,
    name: skillInput.name || 'New Skill',
    category: skillInput.category || 'Other',
    icon: skillInput.icon || 'Code',
    order: Number(skillInput.order) || 99,
    visible: skillInput.visible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalSkills();
    const existingIdx = localList.findIndex((s) => s.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newSkill;
    } else {
      localList.push(newSkill);
    }
    saveStoredLocalSkills(localList);
    invalidateSkillsCache();
    return { success: true, data: newSkill, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.SKILLS, id);
    await setDoc(docRef, {
      ...newSkill,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalSkills();
    const existingIdx = localList.findIndex((s) => s.id === id);
    if (existingIdx >= 0) {
      localList[existingIdx] = newSkill;
    } else {
      localList.push(newSkill);
    }
    saveStoredLocalSkills(localList);
    invalidateSkillsCache();

    return { success: true, data: newSkill, isLive: true };
  } catch (err) {
    console.error('[Firebase] createSkill error:', err);
    return { success: false, error: err.message, data: newSkill };
  }
}

/**
 * UPDATE an existing skill
 */
export async function updateSkill(skillId, updateData) {
  if (!skillId) return { success: false, error: 'Skill ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalSkills();
    const index = localList.findIndex((s) => s.id === skillId);
    let updatedSkill = null;

    if (index >= 0) {
      updatedSkill = {
        ...localList[index],
        ...updateData,
        order: updateData.order !== undefined ? Number(updateData.order) : localList[index].order,
        visible: updateData.visible !== undefined ? Boolean(updateData.visible) : localList[index].visible,
        updatedAt: new Date().toISOString(),
      };
      localList[index] = updatedSkill;
      saveStoredLocalSkills(localList);
      invalidateSkillsCache();
    }
    return { success: true, data: updatedSkill, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.SKILLS, skillId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    const localList = getStoredLocalSkills();
    const index = localList.findIndex((s) => s.id === skillId);
    let updatedSkill = null;
    if (index >= 0) {
      updatedSkill = {
        ...localList[index],
        ...updateData,
        order: updateData.order !== undefined ? Number(updateData.order) : localList[index].order,
        visible: updateData.visible !== undefined ? Boolean(updateData.visible) : localList[index].visible,
        updatedAt: new Date().toISOString(),
      };
      localList[index] = updatedSkill;
      saveStoredLocalSkills(localList);
    }
    invalidateSkillsCache();

    return { success: true, data: updatedSkill, isLive: true };
  } catch (err) {
    console.error('[Firebase] updateSkill error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * DELETE a skill
 */
export async function deleteSkill(skillId) {
  if (!skillId) return { success: false, error: 'Skill ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalSkills();
    const filtered = localList.filter((s) => s.id !== skillId);
    saveStoredLocalSkills(filtered);
    invalidateSkillsCache();
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.SKILLS, skillId);
    await deleteDoc(docRef);

    const localList = getStoredLocalSkills();
    const filtered = localList.filter((s) => s.id !== skillId);
    saveStoredLocalSkills(filtered);
    invalidateSkillsCache();

    return { success: true, isLive: true };
  } catch (err) {
    console.error('[Firebase] deleteSkill error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle skill visibility
 */
export async function toggleSkillVisibility(skillId, currentVisible) {
  return updateSkill(skillId, { visible: !currentVisible });
}

/**
 * Seed Firestore skills collection if empty
 */
export async function seedFirestoreSkills() {
  if (!isFirebaseConfigured || !db) {
    return { success: false, message: 'Firebase is not configured yet.' };
  }

  try {
    const skillsRef = collection(db, COLLECTIONS.SKILLS);
    const snapshot = await getDocs(skillsRef);

    if (!snapshot.empty) {
      return { success: true, message: 'Skills collection already populated.' };
    }

    for (const skill of defaultSkillsList) {
      const docRef = doc(db, COLLECTIONS.SKILLS, skill.id);
      await setDoc(docRef, skill);
    }

    return { success: true, message: `Successfully seeded ${defaultSkillsList.length} skills.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
