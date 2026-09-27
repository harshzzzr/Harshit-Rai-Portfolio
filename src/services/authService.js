import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

// Local storage key for fallback/demo admin session when Firebase is unconfigured
const DEMO_AUTH_KEY = 'harshit_portfolio_admin_session';

/**
 * Production Whitelist of Admin Emails matching firestore.rules
 */
export const ADMIN_EMAILS = [
  'harshittrrai@gmail.com',
  'admin@harshitrai.com',
];

/**
 * Verify whether an authenticated user matches administrator authorization
 */
export function isUserAdmin(user) {
  if (!user) return false;
  if (user.isDemo && import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true') return true;
  const email = user.email ? user.email.toLowerCase().trim() : '';
  if (ADMIN_EMAILS.includes(email)) return true;
  if (user.admin === true || user.customClaims?.admin === true || user.claims?.admin === true) return true;
  return false;
}

/**
 * Async verification including Firebase Auth custom token claims (getIdTokenResult)
 */
export async function checkUserAdmin(user) {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  if (typeof user.getIdTokenResult === 'function') {
    try {
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult?.claims?.admin === true) return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Log in admin via Firebase Authentication
 * @param {string} email
 * @param {string} password
 */
export async function loginAdmin(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // If Firebase Authentication is active
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const authorized = await checkUserAdmin(user);

      if (!authorized) {
        await signOut(auth);
        return {
          success: false,
          error: 'Access denied: Your account is not authorized as an administrator.',
        };
      }

      return {
        success: true,
        user,
        isLive: true,
      };
    } catch (err) {
      let friendlyMessage = 'Authentication failed. Please check your credentials.';

      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          friendlyMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'The email address format is invalid.';
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Access temporarily disabled due to too many failed attempts. Try again later.';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Network connection failed. Please check your internet connection.';
          break;
        case 'auth/invalid-api-key':
        case 'auth/api-key-not-valid':
          friendlyMessage = 'Firebase Web API Key is invalid or expired. Check VITE_FIREBASE_API_KEY in .env or enable Demo Mode (VITE_ENABLE_DEMO_AUTH=true).';
          break;
        default:
          friendlyMessage = err.message || friendlyMessage;
      }

      return {
        success: false,
        error: friendlyMessage,
        code: err.code,
      };
    }
  }

  // Graceful Demo / Local Testing Mode (Strictly gated behind VITE_ENABLE_DEMO_AUTH)
  if (import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true') {
    if (email.trim() === 'admin@harshitrai.dev' && password === 'admin123') {
      const demoUser = {
        uid: 'demo-admin-uid',
        email: 'admin@harshitrai.dev',
        displayName: 'Harshit Rai (Admin)',
        isDemo: true,
      };
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demoUser));
      return {
        success: true,
        user: demoUser,
        isLive: false,
        notice: 'Signed in via Development Demo Session.',
      };
    }
  }

  return {
    success: false,
    error: 'Invalid credentials or unauthorized account.',
  };
}

/**
 * Log out current admin
 */
export async function logoutAdmin() {
  localStorage.removeItem(DEMO_AUTH_KEY);

  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Logout error:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Receives (user)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAuthChanges(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Check demo session strictly when demo auth is enabled
  if (import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true') {
    const stored = localStorage.getItem(DEMO_AUTH_KEY);
    if (stored) {
      try {
        callback(JSON.parse(stored));
        return () => {};
      } catch {
        callback(null);
        return () => {};
      }
    }
  }

  callback(null);
  return () => {};
}

/**
 * Get current authenticated user synchronously if available
 */
export function getCurrentUser() {
  if (isFirebaseConfigured && auth) {
    return auth.currentUser;
  }
  if (import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true') {
    const stored = localStorage.getItem(DEMO_AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}
