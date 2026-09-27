import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

const LOCAL_MESSAGES_KEY = 'harshit_portfolio_messages';

export const defaultSampleMessages = [
  {
    id: 'msg-sample-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techinnovate.io',
    subject: 'Full Stack Engineering Opportunity',
    message: 'Hi Harshit,\n\nI reviewed your portfolio and was impressed with your algorithms foundation, C++ systems work, and full-stack projects. We have an upcoming software engineering role on our platform team and would love to discuss your background.\n\nBest,\nSarah Chen\nEngineering Talent Partner',
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-sample-2',
    name: 'David Miller',
    email: 'david.m@devcommunity.org',
    subject: 'Open Source Collaboration Inquiry',
    message: 'Hello Harshit, I came across your portfolio projects and noticed your Arduino and microcontrollers projects. We are organizing a student open-source sprint next month and would love to have you participate or share insights.\n\nCheers,\nDavid',
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  }
];

/**
 * Local storage cache helpers for messages (used for fallback/offline testing)
 */
function getStoredLocalMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (!raw) {
      if (import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
        saveStoredLocalMessages(defaultSampleMessages);
        return defaultSampleMessages;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredLocalMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('[MessageService] Failed to cache message locally:', e);
  }
}

const RATE_LIMIT_COOLDOWN_SECONDS = 45;
const LAST_SUBMISSION_KEY = 'harshit_portfolio_last_msg_ts';

/**
 * Check client-side UX submission cooldown (designed to prevent accidental double submissions).
 * Note: Real security rules and data validation are enforced server-side via firestore.rules.
 */
export function checkClientRateLimit() {
  if (typeof window === 'undefined') return { isLimited: false, remainingSeconds: 0 };
  try {
    const last = localStorage.getItem(LAST_SUBMISSION_KEY);
    if (!last) return { isLimited: false, remainingSeconds: 0 };
    const elapsed = (Date.now() - parseInt(last, 10)) / 1000;
    if (elapsed < RATE_LIMIT_COOLDOWN_SECONDS) {
      return { isLimited: true, remainingSeconds: Math.ceil(RATE_LIMIT_COOLDOWN_SECONDS - elapsed) };
    }
    return { isLimited: false, remainingSeconds: 0 };
  } catch {
    return { isLimited: false, remainingSeconds: 0 };
  }
}

function recordClientSubmissionTime() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SUBMISSION_KEY, Date.now().toString());
  } catch {}
}

/**
 * Basic sanitize string removing script tags
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

/**
 * Validate contact message fields with strict bounds & abuse protection
 */
export function validateContactPayload({ name, email, subject, message, honeypot }) {
  const errors = {};

  // 1. Anti-bot honeypot detection
  if (honeypot && honeypot.trim()) {
    return {
      isValid: false,
      isBot: true,
      error: 'Automated spam submission detected.',
      errors: { general: 'Spam submission detected.' },
    };
  }

  // 2. Client-side rate limiting check
  const rateLimit = checkClientRateLimit();
  if (rateLimit.isLimited) {
    return {
      isValid: false,
      isRateLimited: true,
      remainingSeconds: rateLimit.remainingSeconds,
      error: `Please wait ${rateLimit.remainingSeconds} seconds before sending another message.`,
      errors: { general: `Rate limit active: please wait ${rateLimit.remainingSeconds}s before submitting again.` },
    };
  }

  // 3. Name validation (2 - 100 characters)
  const cleanName = sanitizeString(name);
  if (!cleanName) {
    errors.name = 'Full name is required.';
  } else if (cleanName.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (cleanName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  // 4. Strict email format & length (5 - 150 characters)
  const cleanEmail = sanitizeString(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail) {
    errors.email = 'Email address is required.';
  } else if (cleanEmail.length > 150) {
    errors.email = 'Email address cannot exceed 150 characters.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please provide a valid email address (e.g. name@domain.com).';
  }

  // 5. Subject validation (3 - 200 characters)
  const cleanSubject = sanitizeString(subject);
  if (!cleanSubject) {
    errors.subject = 'Subject is required.';
  } else if (cleanSubject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters long.';
  } else if (cleanSubject.length > 200) {
    errors.subject = 'Subject cannot exceed 200 characters.';
  }

  // 6. Message validation (10 - 3000 characters)
  const cleanMessage = sanitizeString(message);
  if (!cleanMessage) {
    errors.message = 'Message content is required.';
  } else if (cleanMessage.length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  } else if (cleanMessage.length > 3000) {
    errors.message = 'Message cannot exceed 3,000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    },
  };
}

/**
 * Submit contact message to Firestore
 * Fields: name, email, subject, message, createdAt, status ('unread')
 */
export async function submitContactMessage(input) {
  const validation = validateContactPayload(input);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || 'Validation failed. Please check form fields.',
      fieldErrors: validation.errors,
      isRateLimited: validation.isRateLimited || false,
      remainingSeconds: validation.remainingSeconds || 0,
    };
  }

  // Check client-side UX cooldown
  const newDocId = `msg-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const { name, email, subject, message } = validation.sanitized;

  const messagePayload = {
    name,
    email,
    subject,
    message,
    status: 'unread',
    createdAt: nowIso,
  };

  // If Firebase is configured, submit directly to Firestore
  if (isFirebaseConfigured && db) {
    try {
      const messagesCol = collection(db, COLLECTIONS.MESSAGES);
      const docRef = await addDoc(messagesCol, {
        ...messagePayload,
        createdAt: serverTimestamp(),
      });

      // On successful Firestore write, record cooldown and mirror to local cache
      recordClientSubmissionTime();
      const localList = getStoredLocalMessages();
      localList.unshift({
        id: docRef.id,
        ...messagePayload,
      });
      saveStoredLocalMessages(localList);

      return {
        success: true,
        id: docRef.id,
        isLive: true,
        message: 'Thank you! Your message has been safely delivered to Cloud Firestore.',
      };
    } catch (err) {
      console.error('[Firebase] submitContactMessage error:', err);
      return {
        success: false,
        error: err.message || 'Failed to submit your message. Please try again later.',
      };
    }
  }

  // Local offline fallback mode (only when Firebase is unconfigured)
  recordClientSubmissionTime();
  const localList = getStoredLocalMessages();
  localList.unshift({
    id: newDocId,
    ...messagePayload,
  });
  saveStoredLocalMessages(localList);

  return {
    success: true,
    id: newDocId,
    isLive: false,
    message: 'Thank you! Your message has been received (local offline fallback mode).',
  };
}

/**
 * Admin-only: Fetch all received messages (ordered by creation date desc)
 */
export async function getMessages() {
  if (!isFirebaseConfigured || !db) {
    const local = getStoredLocalMessages();
    return {
      data: local,
      error: null,
      isLive: false,
    };
  }

  try {
    const messagesCol = collection(db, COLLECTIONS.MESSAGES);
    let q;
    try {
      q = query(messagesCol, orderBy('createdAt', 'desc'));
    } catch {
      q = messagesCol;
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: [],
        error: null,
        isLive: true,
      };
    }

    const messages = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      let createdAtDate = null;
      if (d.createdAt?.toDate) {
        createdAtDate = d.createdAt.toDate().toISOString();
      } else if (d.createdAt) {
        createdAtDate = d.createdAt;
      }

      return {
        id: docSnap.id,
        name: d.name || '',
        email: d.email || '',
        subject: d.subject || '',
        message: d.message || '',
        status: d.status || 'unread',
        createdAt: createdAtDate || new Date().toISOString(),
      };
    });

    saveStoredLocalMessages(messages);

    return {
      data: messages,
      error: null,
      isLive: true,
    };
  } catch (err) {
    console.warn('[Firebase] getMessages error:', err.message);
    return {
      data: [],
      error: 'Unable to load messages from Cloud Firestore.',
      isLive: false,
    };
  }
}

/**
 * Admin-only: Get total messages count
 */
export async function getMessageCount() {
  const res = await getMessages();
  return (res.data || []).length;
}

/**
 * Admin-only: Update message status ('read' | 'unread' | 'archived')
 */
export async function updateMessageStatus(messageId, status) {
  if (!messageId) return { success: false, error: 'Message ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalMessages();
    const index = localList.findIndex((m) => m.id === messageId);
    if (index >= 0) {
      localList[index].status = status;
      saveStoredLocalMessages(localList);
    }
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await updateDoc(docRef, { status });

    // Update local cache on successful Firebase write
    const localList = getStoredLocalMessages();
    const index = localList.findIndex((m) => m.id === messageId);
    if (index >= 0) {
      localList[index].status = status;
      saveStoredLocalMessages(localList);
    }

    return { success: true, isLive: true };
  } catch (err) {
    console.error('[Firebase] updateMessageStatus error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Admin-only: Delete a message
 */
export async function deleteMessage(messageId) {
  if (!messageId) return { success: false, error: 'Message ID is required' };

  if (!isFirebaseConfigured || !db) {
    const localList = getStoredLocalMessages();
    const filtered = localList.filter((m) => m.id !== messageId);
    saveStoredLocalMessages(filtered);
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await deleteDoc(docRef);

    // Update local cache on successful Firebase delete
    const localList = getStoredLocalMessages();
    const filtered = localList.filter((m) => m.id !== messageId);
    saveStoredLocalMessages(filtered);

    return { success: true, isLive: true };
  } catch (err) {
    console.error('[Firebase] deleteMessage error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Convenience shortcuts
 */
export async function markMessageRead(messageId) {
  return updateMessageStatus(messageId, 'read');
}

export async function markMessageUnread(messageId) {
  return updateMessageStatus(messageId, 'unread');
}

export async function archiveMessage(messageId) {
  return updateMessageStatus(messageId, 'archived');
}

export async function unarchiveMessage(messageId) {
  return updateMessageStatus(messageId, 'read');
}

