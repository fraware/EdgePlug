import { useTranslation as useI18nTranslation } from 'react-i18next';

// Comprehensive type for translation keys
type TranslationKeys = 
  | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.delete' | 'common.edit' | 'common.close' | 'common.back' | 'common.next' | 'common.previous' | 'common.search' | 'common.filter' | 'common.sort' | 'common.refresh' | 'common.retry' | 'common.offline' | 'common.online'
  | 'navigation.dashboard' | 'navigation.canvas' | 'navigation.marketplace' | 'navigation.fleet' | 'navigation.alerts' | 'navigation.settings' | 'navigation.documentation'
  | 'dashboard.title' | 'dashboard.overview' | 'dashboard.activeDevices' | 'dashboard.totalAlerts' | 'dashboard.systemHealth' | 'dashboard.performance' | 'dashboard.recentActivity'
  | 'canvas.title' | 'canvas.workspace' | 'canvas.toolbox' | 'canvas.properties' | 'canvas.addNode' | 'canvas.connectNodes' | 'canvas.deleteNode'
  | 'canvas.nodeTypes.plc' | 'canvas.nodeTypes.transformer' | 'canvas.nodeTypes.breaker' | 'canvas.nodeTypes.sensor' | 'canvas.nodeTypes.actuator'
  | 'marketplace.title' | 'marketplace.searchPlaceholder'
  | 'marketplace.categories.all' | 'marketplace.categories.plc' | 'marketplace.categories.transformer' | 'marketplace.categories.breaker' | 'marketplace.categories.sensor' | 'marketplace.categories.actuator'
  | 'marketplace.filters.price' | 'marketplace.filters.rating' | 'marketplace.filters.certified' | 'marketplace.filters.vendor'
  | 'marketplace.item.downloads' | 'marketplace.item.rating' | 'marketplace.item.size' | 'marketplace.item.version' | 'marketplace.item.lastUpdated' | 'marketplace.item.install' | 'marketplace.item.preview'
  | 'fleet.title' | 'fleet.devices' | 'fleet.groups' | 'fleet.deployments' | 'fleet.monitoring'
  | 'fleet.device.status' | 'fleet.device.online' | 'fleet.device.offline' | 'fleet.device.error' | 'fleet.device.lastSeen' | 'fleet.device.location' | 'fleet.device.type'
  | 'alerts.title'
  | 'performance.title' | 'performance.latency' | 'performance.throughput' | 'performance.errors' | 'performance.availability'
  | 'settings.title' | 'settings.general' | 'settings.security' | 'settings.notifications' | 'settings.appearance'
  | 'errors.guardTrip' | 'errors.guardTripTitle' | 'errors.guardTripDescription' | 'errors.guardTripWarning' | 'errors.guardTripRecommendation' | 'errors.muteDuration' | 'errors.muteFor'
  | 'accessibility.skipToContent' | 'accessibility.menuToggle' | 'accessibility.closeMenu';

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