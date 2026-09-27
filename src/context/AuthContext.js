import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import seedUsers from '../data/users';
import usePersistentReducer from '../hooks/usePersistentReducer';

const AuthContext = createContext(undefined);

// Registered users (seeded from src/data/users.js, sign-ups are appended).
function usersReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return Array.isArray(action.payload) ? action.payload : state;
    case 'ADD_USER':
      return [...state, action.payload];
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [users, dispatchUsers, isHydrated] = usePersistentReducer(usersReducer, seedUsers, '@dastarkhwan/users');
  // The logged-in user lives here instead of in LoginScreen's local state (Q6).
  const [user, setUser] = useState(null);

  const login = useCallback((loggedInUser) => {
    // Never keep the password in the session object.
    const { password, ...safeUser } = loggedInUser;
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  // Mock "API" helpers used by the Login/Signup screen.
  const findUser = useCallback(
    (email, password) =>
      users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password) || null,
    [users]
  );

  const emailExists = useCallback(
    (email) => users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()),
    [users]
  );

  const signup = useCallback(
    ({ fullName, email, password, role }) => {
      const newUser = { id: `u${Date.now()}`, fullName: fullName.trim(), email: email.trim().toLowerCase(), password, role };
      dispatchUsers({ type: 'ADD_USER', payload: newUser });
      return newUser;
    },
    [dispatchUsers]
  );

  const value = useMemo(
    () => ({ user, login, logout, findUser, emailExists, signup, isHydrated }),
    [user, login, logout, findUser, emailExists, signup, isHydrated]
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
