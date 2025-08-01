import { useTranslation as useI18nTranslation } from 'react-i18next';

// Type for translation keys
type TranslationKeys = keyof typeof import('../locales/en.json');

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (language: 'en' | 'fr') => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fr' ? 'ltr' : 'ltr'; // Add RTL support if needed
  };

  const getCurrentLanguage = () => i18n.language;

  const isRTL = () => {
    const currentLang = getCurrentLanguage();
    return currentLang === 'ar' || currentLang === 'he'; // Add RTL languages as needed
  };

  return {
    t: (key: TranslationKeys, options?: any) => t(key, options),
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    i18n,
  };
}; 