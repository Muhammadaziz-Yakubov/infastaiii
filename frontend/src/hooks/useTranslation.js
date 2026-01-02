import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAppStore } from '../stores/useAppStore';

// Custom hook for translations
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language || 'uz',
  };
};

