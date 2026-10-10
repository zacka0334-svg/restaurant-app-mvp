import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(undefined);
const SESSION_KEY = '@dastarkhwan/session'; // { token, user }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // On app start: read the saved session, so the user stays logged in.
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        setAuthToken(saved.token);
        setToken(saved.token);
        setUser(saved.user);
      })
      .catch(() => {})
      .finally(() => setIsHydrated(true));
  }, []);

  const saveSession = useCallback(async ({ token: newToken, user: newUser }) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: newToken, user: newUser }));
    return newUser;
  }, []);

  // POST /api/auth/login -> { token, user }
  const login = useCallback(
    async (email, password) => saveSession(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [saveSession]
  );

  // POST /api/auth/register -> { token, user }
  const register = useCallback(
    async ({ fullName, email, password, role }) =>
      saveSession(await api('/auth/register', { method: 'POST', body: { fullName, email, password, role } })),
    [saveSession]
  );

  // Logout clears the token from memory AND from AsyncStorage.
  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout, isHydrated }),
    [user, token, login, register, logout, isHydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used inside an <AuthProvider>. Wrap your app in AuthProvider (see App.js).');
  }
  return ctx;
}

export default AuthContext;
