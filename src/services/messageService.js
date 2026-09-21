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

/**
 * Local storage cache helpers for messages (used for fallback/offline testing)
 */
function getStoredLocalMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (!raw) return [];
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

/**
 * Validate contact message fields
 */
export function validateContactPayload({ name, email, subject, message }) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!subject || !subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters long.';
  }

  if (!message || !message.trim()) {
    errors.message = 'Message content is required.';
  } else if (message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
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
      error: 'Validation failed. Please check form fields.',
      fieldErrors: validation.errors,
    };
  }

  const newDocId = `msg-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const messagePayload = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'unread',
    createdAt: nowIso,
  };

  // Cache locally for fallback and test inspection
  const localList = getStoredLocalMessages();
  localList.unshift({
    id: newDocId,
    ...messagePayload,
  });
  saveStoredLocalMessages(localList);

  if (!isFirebaseConfigured || !db) {
    return {
      success: true,
      id: newDocId,
      isLive: false,
      message: 'Thank you! Your message has been received (local offline fallback mode).',
    };
  }

  try {
    const messagesCol = collection(db, COLLECTIONS.MESSAGES);
    const docRef = await addDoc(messagesCol, {
      ...messagePayload,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
      isLive: true,
      message: 'Thank you! Your message has been safely delivered to Cloud Firestore.',
    };
  } catch (err) {
    console.error('[Firebase] submitContactMessage error:', err);
    // Return friendly error with error message
    return {
      success: false,
      error: err.message || 'Failed to submit your message. Please try again later.',
    };
  }
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
      const local = getStoredLocalMessages();
      return {
        data: local,
        error: null,
        isLive: false,
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
    console.warn('[Firebase] getMessages error, falling back:', err.message);
    return {
      data: getStoredLocalMessages(),
      error: err.message,
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

  // Update local cache
  const localList = getStoredLocalMessages();
  const index = localList.findIndex((m) => m.id === messageId);
  if (index >= 0) {
    localList[index].status = status;
    saveStoredLocalMessages(localList);
  }

  if (!isFirebaseConfigured || !db) {
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await updateDoc(docRef, { status });
    return { success: true, isLive: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin-only: Delete a message
 */
export async function deleteMessage(messageId) {
  if (!messageId) return { success: false, error: 'Message ID is required' };

  const localList = getStoredLocalMessages();
  const filtered = localList.filter((m) => m.id !== messageId);
  saveStoredLocalMessages(filtered);

  if (!isFirebaseConfigured || !db) {
    return { success: true, isLive: false };
  }

  try {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await deleteDoc(docRef);
    return { success: true, isLive: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
