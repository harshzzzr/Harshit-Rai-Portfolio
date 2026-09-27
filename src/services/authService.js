import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

// Local storage key for authenticated administrator session
const ADMIN_AUTH_KEY = 'harshit_portfolio_admin_session';

/**
 * Single Authorized Administrator Account
 */
export const PRIMARY_ADMIN_EMAIL = 'harshittrrai@gmail.com';
export const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL];

// Administrator password requirement
const ADMIN_PASSWORD_TARGET = 'Harsh@6206';

/**
 * Verify whether an authenticated user matches administrator authorization
 */
export function isUserAdmin(user) {
  if (!user) return false;
  const email = user.email ? user.email.toLowerCase().trim() : '';
  return email === PRIMARY_ADMIN_EMAIL;
}

/**
 * Async verification of administrator authorization
 */
export async function checkUserAdmin(user) {
  if (!user) return false;
  return isUserAdmin(user);
}

/**
 * Log in admin - strictly restricted to harshittrrai@gmail.com with Harsh@6206
 * @param {string} email
 * @param {string} password
 */
export async function loginAdmin(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Strict check: Only one authorized administrator account
  if (normalizedEmail !== PRIMARY_ADMIN_EMAIL) {
    return {
      success: false,
      error: 'Access denied: Only the authorized administrator account (harshittrrai@gmail.com) is permitted.',
    };
  }

  // Strict check: Verify administrator password
  if (password !== ADMIN_PASSWORD_TARGET) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.',
    };
  }

  // If Firebase Authentication is active and configured, sync with Firebase Auth
  if (isFirebaseConfigured && auth) {
    try {
      let firebaseUser = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        firebaseUser = userCredential.user;
      } catch (signInErr) {
        // If account does not exist yet in Firebase Auth, attempt to create it
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/invalid-login-credentials'
        ) {
          try {
            const newCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            firebaseUser = newCredential.user;
          } catch {
            // Fallback handled below
          }
        }
      }

      if (firebaseUser) {
        const adminUser = {
          uid: firebaseUser.uid,
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'Harshit Rai',
          isLive: true,
        };
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(adminUser));
        return {
          success: true,
          user: adminUser,
          isLive: true,
        };
      }
    } catch (fbErr) {
      console.warn('[Auth] Firebase Auth notice:', fbErr.message);
    }
  }

  // Establish verified administrator session
  const adminUser = {
    uid: 'admin-harshit-rai',
    email: PRIMARY_ADMIN_EMAIL,
    displayName: 'Harshit Rai',
    isLive: false,
  };
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(adminUser));

  return {
    success: true,
    user: adminUser,
    isLive: false,
  };
}

/**
 * Log out current admin
 */
export async function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_KEY);

  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Auth] Firebase logout notice:', err.message);
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
  const getStoredAdmin = () => {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL) {
          return parsed;
        }
      } catch {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    }
    return null;
  };

  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL) {
        callback({
          uid: user.uid,
          email: PRIMARY_ADMIN_EMAIL,
          displayName: user.displayName || 'Harshit Rai',
          isLive: true,
        });
      } else {
        const storedAdmin = getStoredAdmin();
        callback(storedAdmin);
      }
    });
  }

  const storedAdmin = getStoredAdmin();
  callback(storedAdmin);
  return () => {};
}

/**
 * Get current authenticated user synchronously if available
 */
export function getCurrentUser() {
  if (isFirebaseConfigured && auth?.currentUser) {
    const email = auth.currentUser.email?.toLowerCase().trim();
    if (email === PRIMARY_ADMIN_EMAIL) {
      return {
        uid: auth.currentUser.uid,
        email: PRIMARY_ADMIN_EMAIL,
        displayName: auth.currentUser.displayName || 'Harshit Rai',
        isLive: true,
      };
    }
  }

  const stored = localStorage.getItem(ADMIN_AUTH_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
}
