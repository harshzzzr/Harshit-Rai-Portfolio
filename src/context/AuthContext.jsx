import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { loginAdmin, logoutAdmin, subscribeToAuthChanges, isUserAdmin, checkUserAdmin } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminState, setIsAdminState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        const authorized = await checkUserAdmin(user);
        if (isMounted) setIsAdminState(authorized);
      } else {
        if (isMounted) setIsAdminState(false);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginAdmin(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      const authorized = await checkUserAdmin(result.user);
      setIsAdminState(authorized);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    const result = await logoutAdmin();
    setCurrentUser(null);
    setIsAdminState(false);
    return result;
  }, []);

  const isAdmin = useMemo(() => isAdminState || isUserAdmin(currentUser), [isAdminState, currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      isAdmin,
      login,
      logout,
    }),
    [currentUser, loading, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
