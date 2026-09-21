import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { loginAdmin, logoutAdmin, subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginAdmin(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    const result = await logoutAdmin();
    setCurrentUser(null);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
    }),
    [currentUser, loading, login, logout]
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
