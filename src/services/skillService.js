import {
  collection,
  getDocs,
  doc,
  setDoc,
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
  { id: 'skill-unity', name: 'Unity', category: 'Other', icon: 'Layers', order: 18, visible: true },
];

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
export async function getSkills() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: groupSkillsByCategory(defaultSkillsList),
      rawList: defaultSkillsList,
      error: null,
      isLive: false,
    };
  }

  try {
    const skillsRef = collection(db, COLLECTIONS.SKILLS);
    let q;
    try {
      q = query(skillsRef, orderBy('order', 'asc'));
    } catch {
      q = skillsRef;
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: groupSkillsByCategory(defaultSkillsList),
        rawList: defaultSkillsList,
        error: null,
        isLive: false,
      };
    }

    const skills = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || '',
      category: docSnap.data().category || 'Other',
      icon: docSnap.data().icon || 'Code',
      order: typeof docSnap.data().order === 'number' ? docSnap.data().order : 99,
      visible: docSnap.data().visible !== false,
      ...docSnap.data()
    }));

    return {
      data: groupSkillsByCategory(skills),
      rawList: skills,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] Firestore getSkills error, using fallback:', err.message);
    return {
      data: groupSkillsByCategory(defaultSkillsList),
      rawList: defaultSkillsList,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
  }
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
