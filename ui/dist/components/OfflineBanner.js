import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from './Badge';
import { Button } from './Button';
export const OfflineBanner = ({ className, onRetry }) => {
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
    if (!showBanner)
        return null;
    return (_jsx("div", { className: `fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 ${className}`, children: _jsxs("div", { className: "flex items-center justify-between max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Badge, { variant: "error", size: "sm", children: isOnline ? t('common.online') : t('common.offline') }), _jsx("span", { className: "text-sm font-medium", children: isOnline ? t('common.online') : t('common.offline') })] }), !isOnline && onRetry && (_jsx(Button, { variant: "ghost", size: "sm", onClick: onRetry, className: "text-white hover:bg-red-700", children: t('common.retry') }))] }) }));
};
//# sourceMappingURL=OfflineBanner.js.map