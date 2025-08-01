import React from 'react';
import { useLatencyBadge, LatencyBadgeState, LatencyTier } from '../hooks/useLatencyBadge';
export interface LatencyBadgeProps {
    state: LatencyBadgeState;
    showMetrics?: boolean;
    showDetails?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'compact' | 'detailed' | 'minimal';
}
export declare const LatencyBadge: React.FC<LatencyBadgeProps>;
export declare const LatencyBadgeWithHook: React.FC<{
    hookState: ReturnType<typeof useLatencyBadge>;
    showMetrics?: boolean;
    showDetails?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'compact' | 'detailed' | 'minimal';
}>;
export declare const PerformanceIndicator: React.FC<{
    latency: number;
    tier: LatencyTier;
    isActive?: boolean;
    className?: string;
}>;
export declare const PerformanceChart: React.FC<{
    metrics: LatencyBadgeState['metrics'];
    className?: string;
}>;
//# sourceMappingURL=LatencyBadge.d.ts.map