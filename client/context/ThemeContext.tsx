import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  card: string;
  border: string;
  primary: string;
  accent: string;
  text: string;
  textMuted: string;
  success: string;
};

const LIGHT: ThemeColors = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  border: '#E2E2E2',
  primary: '#d11f2f',
  accent: '#d4a017',
  text: '#111111',
  textMuted: '#555555',
  success: '#2e8b57',
};

const DARK: ThemeColors = {
  bg: '#121212',
  card: '#1E1E1E',
  border: '#333333',
  primary: '#d11f2f',
  accent: '#FFD700',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  success: '#4CAF50',
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
  const [mode, setMode] = useState<ThemeMode>(system);

  // Optional: listen to system changes only when user has not overridden
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (!colorScheme) return;
      // Only auto-update if user hasn't chosen manually; keep simple: always follow system when changed
      setMode(colorScheme === 'light' ? 'light' : 'dark');
    });
    return () => sub.remove();
  }, []);

  const setTheme = useCallback((m: ThemeMode) => setMode(m), []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: mode === 'light' ? LIGHT : DARK,
      toggleTheme,
      setTheme,
    }),
    [mode, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
};
