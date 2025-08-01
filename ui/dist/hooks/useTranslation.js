import { useTranslation as useI18nTranslation } from 'react-i18next';
export const useTranslation = () => {
    const { t, i18n } = useI18nTranslation();
    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fr' ? 'ltr' : 'ltr';
    };
    const getCurrentLanguage = () => i18n.language;
    const isRTL = () => {
        const currentLang = getCurrentLanguage();
        return currentLang === 'ar' || currentLang === 'he';
    };
    return {
        t: (key, options) => t(key, options),
        changeLanguage,
        getCurrentLanguage,
        isRTL,
        i18n,
    };
};
//# sourceMappingURL=useTranslation.js.map