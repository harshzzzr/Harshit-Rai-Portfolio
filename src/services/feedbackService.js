import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

const LOCAL_FEEDBACK_KEY = 'harshit_portfolio_feedback';

// In-memory cache for public approved feedback to reduce redundant queries
let memoryCacheApprovedFeedback = null;
let memoryCacheApprovedTime = 0;
const FEEDBACK_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export function invalidateFeedbackCache() {
  memoryCacheApprovedFeedback = null;
  memoryCacheApprovedTime = 0;
}

export const defaultSampleFeedback = [
  {
    id: 'fb-sample-1',
    name: 'Prof. Ramesh Sharma',
    rating: 5,
    feedback: 'Harshit exhibits exceptional analytical and problem-solving skills. His coursework in Data Structures, Algorithms, and Operating Systems has consistently stood out.',
    status: 'approved',
    featured: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    createdAtIso: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 'fb-sample-2',
    name: 'Ananya Gupta',
    rating: 5,
    feedback: 'Collaborated with Harshit during the 36-hour hackathon. His ability to rapidly architect full-stack prototypes under tight deadlines was instrumental to our team winning 1st place.',
    status: 'approved',
    featured: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    createdAtIso: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  },
  {
    id: 'fb-sample-3',
    name: 'Karan Verma',
    rating: 4,
    feedback: 'Great understanding of C++ fundamentals and systems architecture. Clear communication and dependable contributions throughout collaborative engineering projects.',
    status: 'pending',
    featured: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAtIso: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

/**
 * Local storage cache helpers for feedback (used for fallback/offline testing)
 */
function getStoredLocalFeedback() {
  if (typeof window === 'undefined') return defaultSampleFeedback;
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (!raw) {
      saveStoredLocalFeedback(defaultSampleFeedback);
      return defaultSampleFeedback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSampleFeedback;
  } catch {
    return defaultSampleFeedback;
  }
}

function saveStoredLocalFeedback(feedbackList) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(feedbackList));
  } catch (e) {
    console.warn('[FeedbackService] Failed to cache feedback locally:', e);
  }
}

/**
 * String sanitizer removing null bytes and control chars
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\0/g, '').replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

/**
 * Submit public feedback
 * Strictly stores submission with status: 'pending'
 * Rating must be an integer between 1 and 5
 */
export async function submitFeedback({ name, rating, feedback, honeypot = '' }) {
  // Anti-bot honeypot check
  if (honeypot && honeypot.trim().length > 0) {
    console.warn('[FeedbackService] Bot submission rejected via honeypot.');
    return {
      success: true,
      message: 'Feedback submitted successfully.',
      id: 'bot-filtered'
    };
  }

  // Sanitize
  const cleanName = sanitizeString(name);
  const cleanRating = parseInt(rating, 10);
  const cleanFeedback = sanitizeString(feedback);

  // Field validation
  const errors = {};
  if (!cleanName || cleanName.length < 2) {
    errors.name = 'Name is required (at least 2 characters).';
  } else if (cleanName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
    errors.rating = 'Please provide a valid rating between 1 and 5 stars.';
  }

  if (!cleanFeedback || cleanFeedback.length < 5) {
    errors.feedback = 'Feedback is required (at least 5 characters).';
  } else if (cleanFeedback.length > 1000) {
    errors.feedback = 'Feedback cannot exceed 1000 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const nowIso = new Date().toISOString();

  // Firestore submission
  if (isFirebaseConfigured && db) {
    try {
      const payload = {
        name: cleanName,
        rating: cleanRating,
        feedback: cleanFeedback,
        status: 'pending', // Strictly pending! Never auto-published
        createdAt: serverTimestamp(),
        createdAtIso: nowIso
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACK), payload);

      // Also mirror to local cache for consistency
      const localFeedback = getStoredLocalFeedback();
      localFeedback.unshift({
        id: docRef.id,
        ...payload,
        createdAt: nowIso
      });
      saveStoredLocalFeedback(localFeedback);

      return {
        success: true,
        id: docRef.id,
        message: 'Thank you! Your feedback has been submitted for moderation and will appear publicly once approved.'
      };
    } catch (err) {
      console.warn('[FeedbackService] Firestore submission failed, using local cache fallback:', err);
      // Fall through to local fallback
    }
  }

  // Local fallback / Offline mode
  const localFeedback = getStoredLocalFeedback();
  const localId = 'fb-' + Date.now();
  const newEntry = {
    id: localId,
    name: cleanName,
    rating: cleanRating,
    feedback: cleanFeedback,
    status: 'pending', // Strictly pending
    createdAt: nowIso,
    createdAtIso: nowIso
  };

  localFeedback.unshift(newEntry);
  saveStoredLocalFeedback(localFeedback);

  return {
    success: true,
    id: localId,
    message: 'Thank you! Your feedback has been submitted for moderation and will appear publicly once approved.'
  };
}

/**
 * Fetch ONLY approved feedback for public display
 * Pending and rejected feedback items are strictly filtered out
 * Featured items are prioritized first, followed by newest
 */
export async function getApprovedFeedback() {
  const now = Date.now();
  if (memoryCacheApprovedFeedback && now - memoryCacheApprovedTime < FEEDBACK_CACHE_TTL) {
    return { success: true, data: memoryCacheApprovedFeedback };
  }

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, COLLECTIONS.FEEDBACK),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let dateVal = data.createdAtIso;
        if (!dateVal && data.createdAt?.toDate) {
          dateVal = data.createdAt.toDate().toISOString();
        }
        items.push({
          id: docSnap.id,
          name: data.name,
          rating: data.rating,
          feedback: data.feedback,
          status: 'approved',
          featured: Boolean(data.featured),
          createdAt: dateVal || new Date().toISOString()
        });
      });

      // Sort featured first, then newest
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      memoryCacheApprovedFeedback = items;
      memoryCacheApprovedTime = now;

      return { success: true, data: items };
    } catch (err) {
      console.warn('[FeedbackService] Failed to query approved feedback from Firestore, trying local cache:', err);
    }
  }

  // Fallback to local cache approved items
  const localList = getStoredLocalFeedback();
  const approvedOnly = localList
    .filter((item) => item.status === 'approved')
    .map((item) => ({ ...item, featured: Boolean(item.featured) }));

  approvedOnly.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  memoryCacheApprovedFeedback = approvedOnly;
  memoryCacheApprovedTime = now;

  return { success: true, data: approvedOnly };
}

/**
 * Admin: Fetch all feedback for moderation
 */
export async function getAllFeedback() {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.FEEDBACK));
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let dateVal = data.createdAtIso;
        if (!dateVal && data.createdAt?.toDate) {
          dateVal = data.createdAt.toDate().toISOString();
        }
        items.push({
          id: docSnap.id,
          name: data.name || '',
          rating: data.rating || 5,
          feedback: data.feedback || '',
          status: data.status || 'pending',
          featured: Boolean(data.featured),
          createdAt: dateVal || new Date().toISOString()
        });
      });

      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, data: items };
    } catch (err) {
      console.warn('[FeedbackService] Failed to fetch all feedback from Firestore, using local cache:', err);
    }
  }

  const localList = getStoredLocalFeedback().map((item) => ({
    ...item,
    featured: Boolean(item.featured)
  }));
  localList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { success: true, data: localList };
}

/**
 * Admin: Update feedback status ('approved' | 'rejected' | 'pending')
 */
export async function updateFeedbackStatus(id, newStatus) {
  if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
    return { success: false, error: 'Invalid status value.' };
  }

  invalidateFeedbackCache();

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.FEEDBACK, id);
      await updateDoc(ref, { status: newStatus });
    } catch (err) {
      console.warn('[FeedbackService] Firestore updateStatus failed:', err);
    }
  }

  // Update local cache
  const localList = getStoredLocalFeedback();
  const index = localList.findIndex((item) => item.id === id);
  if (index !== -1) {
    localList[index].status = newStatus;
    saveStoredLocalFeedback(localList);
  }

  return { success: true };
}

/**
 * Admin: Quick helper to approve feedback
 */
export async function approveFeedback(id) {
  return updateFeedbackStatus(id, 'approved');
}

/**
 * Admin: Quick helper to reject feedback
 */
export async function rejectFeedback(id) {
  return updateFeedbackStatus(id, 'rejected');
}

/**
 * Admin: Toggle featured testimonial status
 */
export async function toggleFeaturedFeedback(id, currentFeatured) {
  invalidateFeedbackCache();
  const newFeatured = !currentFeatured;

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.FEEDBACK, id);
      await updateDoc(ref, { featured: newFeatured });
    } catch (err) {
      console.warn('[FeedbackService] Firestore toggleFeatured failed:', err);
    }
  }

  const localList = getStoredLocalFeedback();
  const index = localList.findIndex((item) => item.id === id);
  if (index !== -1) {
    localList[index].featured = newFeatured;
    saveStoredLocalFeedback(localList);
  }

  return { success: true, featured: newFeatured };
}

/**
 * Admin: Delete feedback record
 */
export async function deleteFeedback(id) {
  invalidateFeedbackCache();
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.FEEDBACK, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('[FeedbackService] Firestore delete failed:', err);
    }
  }

  // Update local cache
  const localList = getStoredLocalFeedback();
  const updated = localList.filter((item) => item.id !== id);
  saveStoredLocalFeedback(updated);

  return { success: true };
}
