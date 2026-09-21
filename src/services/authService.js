import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

// Local storage key for fallback/demo admin session when Firebase is unconfigured
const DEMO_AUTH_KEY = 'harshit_portfolio_admin_session';

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
      return {
        success: true,
        user: userCredential.user,
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

  // Graceful Demo / Local Testing Mode (When Firebase keys are not yet configured in .env)
  // Allows testing admin authentication UI and protected routes seamlessly
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
      notice: 'Signed in via Development Demo Session (Configure VITE_FIREBASE_* for production Auth).',
    };
  }

  return {
    success: false,
    error: 'Invalid credentials. (For dev testing without Firebase keys, use admin@harshitrai.dev / admin123)',
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

  // Check demo session
  const stored = localStorage.getItem(DEMO_AUTH_KEY);
  if (stored) {
    try {
      callback(JSON.parse(stored));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  return () => {};
}

/**
 * Get current authenticated user synchronously if available
 */
export function getCurrentUser() {
  if (isFirebaseConfigured && auth) {
    return auth.currentUser;
  }
  const stored = localStorage.getItem(DEMO_AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
}
