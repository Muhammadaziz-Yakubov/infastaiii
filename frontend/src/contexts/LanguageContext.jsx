import React, { createContext, useContext, useState, useEffect } from 'react';

import uz from '../locales/uz.json';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const translations = { uz, ru, en };

const languages = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(l => l.code === language) || languages[0];
  };

  return (
    <LanguageContext.Provider value={{
      language,
      languages,
      t,
      changeLanguage,
      getCurrentLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
