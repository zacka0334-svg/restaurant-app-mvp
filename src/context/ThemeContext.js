import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Start from the device setting, then let the user override it.
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  // Memoised so consumers only re-render when the theme actually changes.
  const value = useMemo(
    () => ({ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom consumer hook: throws a descriptive error outside the provider.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used inside a <ThemeProvider>. Wrap your app in ThemeProvider (see App.js).');
  }
  return ctx;
}

export default ThemeContext;
