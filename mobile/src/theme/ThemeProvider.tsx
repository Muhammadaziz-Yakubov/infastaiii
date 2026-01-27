import React, { createContext, useContext, useState, useEffect } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { AppState } from '@/store/store';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof MD3LightTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    onSurface: '#1E293B',
    onBackground: '#1E293B',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#0F172A',
    surface: '#1E293B',
    onSurface: '#F1F5F9',
    onBackground: '#F1F5F9',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const value = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
