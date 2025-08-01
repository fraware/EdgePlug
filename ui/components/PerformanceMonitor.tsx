import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from './Badge';

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
}

export interface PerformanceMonitorProps {
  className?: string;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showBadge?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  onMetricsUpdate,
  showBadge = false
}) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          setMetrics(prev => ({ ...prev, lcp } as PerformanceMetrics));
        }
        
        if (entry.entryType === 'first-input') {
          const fid = entry.processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, fid } as PerformanceMetrics));
        }
        
        if (entry.entryType === 'layout-shift') {
          const cls = entry.value;
          setMetrics(prev => ({ ...prev, cls } as PerformanceMetrics));
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Measure TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      setMetrics(prev => ({ ...prev, ttfb } as PerformanceMetrics));
    }

    // Measure FCP
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime } as PerformanceMetrics));
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

  const getPerformanceScore = (metrics: PerformanceMetrics) => {
    let score = 100;
    
    // LCP scoring (target: < 2.5s)
    if (metrics.lcp > 2500) score -= 25;
    else if (metrics.lcp > 4000) score -= 50;
    
    // FID scoring (target: < 100ms)
    if (metrics.fid > 100) score -= 25;
    else if (metrics.fid > 300) score -= 50;
    
    // CLS scoring (target: < 0.1)
    if (metrics.cls > 0.1) score -= 25;
    else if (metrics.cls > 0.25) score -= 50;
    
    return Math.max(0, score);
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 90) return { variant: 'success' as const, label: t('performance.excellent') };
    if (score >= 70) return { variant: 'warning' as const, label: t('performance.good') };
    if (score >= 50) return { variant: 'error' as const, label: t('performance.fair') };
    return { variant: 'error' as const, label: t('performance.poor') };
  };

  if (!isMonitoring || !metrics) return null;

  const score = getPerformanceScore(metrics);
  const status = getPerformanceStatus(score);

  return (
    <div className={`performance-monitor ${className}`}>
      {showBadge && (
        <Badge variant={status.variant} size="sm">
          {status.label}
        </Badge>
      )}
      
      <div className="text-xs text-gray-600 space-y-1">
        <div>LCP: {metrics.lcp?.toFixed(0)}ms</div>
        <div>FID: {metrics.fid?.toFixed(0)}ms</div>
        <div>CLS: {metrics.cls?.toFixed(3)}</div>
        <div>TTFB: {metrics.ttfb?.toFixed(0)}ms</div>
        <div>FCP: {metrics.fcp?.toFixed(0)}ms</div>
      </div>
    </div>
  );
}; 