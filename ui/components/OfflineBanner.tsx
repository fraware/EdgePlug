import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from './Badge';
import { Button } from './Button';

export interface OfflineBannerProps {
  className?: string;
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  className,
  onRetry 
}) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Badge variant="error" size="sm">
            {isOnline ? t('common.online') : t('common.offline')}
          </Badge>
          <span className="text-sm font-medium">
            {isOnline ? t('common.online') : t('common.offline')}
          </span>
        </div>
        {!isOnline && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-white hover:bg-red-700"
          >
            {t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  );
}; 