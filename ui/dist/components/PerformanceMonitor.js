import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from './Badge';
export const PerformanceMonitor = ({ className, onMetricsUpdate, showBadge = false }) => {
    const { t } = useTranslation();
    const [metrics, setMetrics] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    useEffect(() => {
        if (!('PerformanceObserver' in window))
            return;
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    const lcp = entry.startTime;
                    setMetrics(prev => ({ ...prev, lcp }));
                }
                if (entry.entryType === 'first-input') {
                    const fid = entry.processingStart - entry.startTime;
                    setMetrics(prev => ({ ...prev, fid }));
                }
                if (entry.entryType === 'layout-shift') {
                    const cls = entry.value;
                    setMetrics(prev => ({ ...prev, cls }));
                }
            });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
            setMetrics(prev => ({ ...prev, ttfb }));
        }
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
        setIsMonitoring(true);
        return () => {
            observer.disconnect();
        };
    }, []);
    useEffect(() => {
        if (metrics && onMetricsUpdate) {
            onMetricsUpdate(metrics);
        }
    }, [metrics, onMetricsUpdate]);
    const getPerformanceScore = (metrics) => {
        let score = 100;
        if (metrics.lcp > 2500)
            score -= 25;
        else if (metrics.lcp > 4000)
            score -= 50;
        if (metrics.fid > 100)
            score -= 25;
        else if (metrics.fid > 300)
            score -= 50;
        if (metrics.cls > 0.1)
            score -= 25;
        else if (metrics.cls > 0.25)
            score -= 50;
        return Math.max(0, score);
    };
    const getPerformanceStatus = (score) => {
        if (score >= 90)
            return { variant: 'success', label: t('performance.excellent') };
        if (score >= 70)
            return { variant: 'warning', label: t('performance.good') };
        if (score >= 50)
            return { variant: 'error', label: t('performance.fair') };
        return { variant: 'error', label: t('performance.poor') };
    };
    if (!isMonitoring || !metrics)
        return null;
    const score = getPerformanceScore(metrics);
    const status = getPerformanceStatus(score);
    return (_jsxs("div", { className: `performance-monitor ${className}`, children: [showBadge && (_jsx(Badge, { variant: status.variant, size: "sm", children: status.label })), _jsxs("div", { className: "text-xs text-gray-600 space-y-1", children: [_jsxs("div", { children: ["LCP: ", metrics.lcp?.toFixed(0), "ms"] }), _jsxs("div", { children: ["FID: ", metrics.fid?.toFixed(0), "ms"] }), _jsxs("div", { children: ["CLS: ", metrics.cls?.toFixed(3)] }), _jsxs("div", { children: ["TTFB: ", metrics.ttfb?.toFixed(0), "ms"] }), _jsxs("div", { children: ["FCP: ", metrics.fcp?.toFixed(0), "ms"] })] })] }));
};
//# sourceMappingURL=PerformanceMonitor.js.map