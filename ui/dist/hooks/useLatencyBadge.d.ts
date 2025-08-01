export interface LatencyMetrics {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
    count: number;
}
export interface LatencyTier {
    name: string;
    color: string;
    bgColor: string;
    threshold: number;
}
export interface LatencyBadgeState {
    currentLatency: number;
    tier: LatencyTier;
    metrics: LatencyMetrics;
    isActive: boolean;
}
export declare const LATENCY_TIERS: LatencyTier[];
export declare const useLatencyBadge: (options?: {
    maxSamples?: number;
    updateInterval?: number;
    autoReset?: boolean;
    resetInterval?: number;
}) => {
    state: LatencyBadgeState;
    recordLatency: (latency: number) => void;
    startTracking: () => void;
    stopTracking: () => void;
    resetMetrics: () => void;
    getTier: (latency: number) => LatencyTier;
};
export declare const useLatencyMeasurement: (operationName: string) => {
    startMeasurement: () => void;
    endMeasurement: () => number;
    measureAsync: <T>(operation: () => Promise<T>) => Promise<T>;
    measureSync: <T>(operation: () => T) => T;
};
export declare const useInteractionLatency: () => {
    trackInteractionStart: () => void;
    trackInteractionEnd: () => number;
};
export declare const useDragLatency: () => {
    startDrag: () => void;
    updateDrag: () => void;
    endDrag: () => number;
};
//# sourceMappingURL=useLatencyBadge.d.ts.map