import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import seedUsers from '../data/users';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // Registered users (seeded from src/data/users.js, sign-ups are appended).
  const [users, setUsers] = useState(seedUsers);
  // The logged-in user lives here instead of in LoginScreen's local state.
  const [user, setUser] = useState(null);

  const login = useCallback((loggedInUser) => {
    // Never keep the password in the session object.
    const { password, ...safeUser } = loggedInUser;
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const findUser = useCallback(
    (email, password) =>
      users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password) || null,
    [users]
  );

  const emailExists = useCallback(
    (email) => users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()),
    [users]
  );

  const signup = useCallback(({ fullName, email, password, role }) => {
    const newUser = { id: `u${Date.now()}`, fullName: fullName.trim(), email: email.trim().toLowerCase(), password, role };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, findUser, emailExists, signup }),
    [user, login, logout, findUser, emailExists, signup]
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
