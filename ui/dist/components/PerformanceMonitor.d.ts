import React from 'react';
export interface PerformanceMetrics {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
}
export interface PerformanceMonitorProps {
    className?: string;
    onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
    showBadge?: boolean;
}
export declare const PerformanceMonitor: React.FC<PerformanceMonitorProps>;
//# sourceMappingURL=PerformanceMonitor.d.ts.map