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

/**
 * Fetch Education records from Firestore
 */
export async function getEducation() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: defaultEducation,
      error: null,
      isLive: false,
    };
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
      return {
        data: defaultEducation,
        error: null,
        isLive: false,
      };
    }

    const list = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((item) => item.visible !== false)
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    return {
      data: list.length > 0 ? list : defaultEducation,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] Firestore getEducation error, using fallback:', err.message);
    return {
      data: defaultEducation,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
  }
}

/**
 * Fetch all Timeline records (Experience, Hackathons, Research, Achievements, Certifications)
 */
export async function getTimelineData() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: groupTimelineByType(defaultTimelineItems),
      rawList: defaultTimelineItems,
      error: null,
      isLive: false,
    };
  }

  try {
    // Attempt reading from unified 'timeline' or 'experience'
    const timelineRef = collection(db, 'timeline');
    let snapshot = await getDocs(timelineRef);

    if (snapshot.empty) {
      // Also check COLLECTIONS.EXPERIENCE
      const expRef = collection(db, COLLECTIONS.EXPERIENCE);
      snapshot = await getDocs(expRef);
    }

    if (snapshot.empty) {
      return {
        data: groupTimelineByType(defaultTimelineItems),
        rawList: defaultTimelineItems,
        error: null,
        isLive: false,
      };
    }

    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return {
      data: groupTimelineByType(items),
      rawList: items,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] Firestore getTimelineData error, using fallback:', err.message);
    return {
      data: groupTimelineByType(defaultTimelineItems),
      rawList: defaultTimelineItems,
      error: `Operating in fallback mode (${err.message})`,
      isLive: false,
    };
  }
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
