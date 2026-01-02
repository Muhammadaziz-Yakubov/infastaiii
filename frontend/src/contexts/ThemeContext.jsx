import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Platforma ranglari
export const platformColors = {
  blue: { name: 'Ko\'k', primary: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
  green: { name: 'Yashil', primary: '#10B981', gradient: 'from-green-500 to-green-600' },
  purple: { name: 'Binafsha', primary: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
  orange: { name: 'Apelsin', primary: '#F59E0B', gradient: 'from-orange-500 to-orange-600' },
  red: { name: 'Qizil', primary: '#EF4444', gradient: 'from-red-500 to-red-600' },
  pink: { name: 'Pushti', primary: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
  indigo: { name: 'Indigo', primary: '#6366F1', gradient: 'from-indigo-500 to-indigo-600' },
  teal: { name: 'Teal', primary: '#14B8A6', gradient: 'from-teal-500 to-teal-600' },
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    const savedColor = localStorage.getItem('primaryColor');
    return savedColor && platformColors[savedColor] ? savedColor : 'blue';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    // CSS variable orqali rangni qo'llash
    const color = platformColors[primaryColor];
    if (color) {
      document.documentElement.style.setProperty('--primary-color', color.primary);
    }
  }, [primaryColor]);

  const toggleTheme = () => setIsDark(!isDark);
  const setColor = (color) => {
    if (platformColors[color]) {
      setPrimaryColor(color);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      primaryColor, 
      setColor,
      colorConfig: platformColors[primaryColor]
    }}>
      {children}
    </ThemeContext.Provider>
  );
};