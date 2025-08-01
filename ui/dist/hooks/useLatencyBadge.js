import { useState, useEffect, useCallback, useRef } from 'react';
export const LATENCY_TIERS = [
    {
        name: 'Excellent',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        threshold: 50,
    },
    {
        name: 'Good',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        threshold: 100,
    },
    {
        name: 'Fair',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        threshold: 200,
    },
    {
        name: 'Poor',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        threshold: 500,
    },
    {
        name: 'Critical',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        threshold: Infinity,
    },
];
export const useLatencyBadge = (options = {}) => {
    const { maxSamples = 100, updateInterval = 1000, autoReset = true, resetInterval = 60000, } = options;
    const [state, setState] = useState({
        currentLatency: 0,
        tier: LATENCY_TIERS[0],
        metrics: {
            min: 0,
            max: 0,
            avg: 0,
            p95: 0,
            p99: 0,
            count: 0,
        },
        isActive: false,
    });
    const samples = useRef([]);
    const lastUpdate = useRef(Date.now());
    const resetTimer = useRef();
    const getTier = useCallback((latency) => {
        for (const tier of LATENCY_TIERS) {
            if (latency <= tier.threshold) {
                return tier;
            }
        }
        return LATENCY_TIERS[LATENCY_TIERS.length - 1];
    }, []);
    const calculateMetrics = useCallback((latencySamples) => {
        if (latencySamples.length === 0) {
            return {
                min: 0,
                max: 0,
                avg: 0,
                p95: 0,
                p99: 0,
                count: 0,
            };
        }
        const sorted = [...latencySamples].sort((a, b) => a - b);
        const count = sorted.length;
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        const avg = sum / count;
        const min = sorted[0];
        const max = sorted[count - 1];
        const p95Index = Math.floor(count * 0.95);
        const p99Index = Math.floor(count * 0.99);
        const p95 = sorted[p95Index];
        const p99 = sorted[p99Index];
        return {
            min,
            max,
            avg: Math.round(avg * 100) / 100,
            p95,
            p99,
            count,
        };
    }, []);
    const recordLatency = useCallback((latency) => {
        const now = Date.now();
        samples.current.push(latency);
        if (samples.current.length > maxSamples) {
            samples.current = samples.current.slice(-maxSamples);
        }
        const metrics = calculateMetrics(samples.current);
        const tier = getTier(latency);
        setState(prev => ({
            ...prev,
            currentLatency: latency,
            tier,
            metrics,
            isActive: true,
        }));
        lastUpdate.current = now;
    }, [maxSamples, calculateMetrics, getTier]);
    const startTracking = useCallback(() => {
        setState(prev => ({ ...prev, isActive: true }));
    }, []);
    const stopTracking = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false }));
    }, []);
    const resetMetrics = useCallback(() => {
        samples.current = [];
        setState(prev => ({
            ...prev,
            currentLatency: 0,
            tier: LATENCY_TIERS[0],
            metrics: {
                min: 0,
                max: 0,
                avg: 0,
                p95: 0,
                p99: 0,
                count: 0,
            },
        }));
    }, []);
    useEffect(() => {
        if (autoReset && resetInterval > 0) {
            resetTimer.current = setInterval(() => {
                resetMetrics();
            }, resetInterval);
            return () => {
                if (resetTimer.current) {
                    clearInterval(resetTimer.current);
                }
            };
        }
        return undefined;
    }, [autoReset, resetInterval, resetMetrics]);
    useEffect(() => {
        if (state.isActive && updateInterval > 0) {
            const interval = setInterval(() => {
                const now = Date.now();
                const timeSinceLastUpdate = now - lastUpdate.current;
                if (timeSinceLastUpdate > updateInterval * 2) {
                    setState(prev => ({
                        ...prev,
                        currentLatency: Math.max(0, prev.currentLatency - 10),
                        tier: getTier(Math.max(0, prev.currentLatency - 10)),
                    }));
                }
            }, updateInterval);
            return () => clearInterval(interval);
        }
        return undefined;
    }, [state.isActive, updateInterval, getTier]);
    return {
        state,
        recordLatency,
        startTracking,
        stopTracking,
        resetMetrics,
        getTier,
    };
};
export const useLatencyMeasurement = (operationName) => {
    const { recordLatency } = useLatencyBadge();
    const startTime = useRef();
    const startMeasurement = useCallback(() => {
        startTime.current = performance.now();
    }, []);
    const endMeasurement = useCallback(() => {
        if (startTime.current) {
            const endTime = performance.now();
            const latency = endTime - startTime.current;
            recordLatency(latency);
            startTime.current = undefined;
            return latency;
        }
        return 0;
    }, [recordLatency]);
    const measureAsync = useCallback(async (operation) => {
        startMeasurement();
        try {
            const result = await operation();
            return result;
        }
        finally {
            endMeasurement();
        }
    }, [startMeasurement, endMeasurement]);
    const measureSync = useCallback((operation) => {
        startMeasurement();
        try {
            const result = operation();
            return result;
        }
        finally {
            endMeasurement();
        }
    }, [startMeasurement, endMeasurement]);
    return {
        startMeasurement,
        endMeasurement,
        measureAsync,
        measureSync,
    };
};
export const useInteractionLatency = () => {
    const { recordLatency } = useLatencyBadge();
    const interactionStart = useRef();
    const trackInteractionStart = useCallback(() => {
        interactionStart.current = performance.now();
    }, []);
    const trackInteractionEnd = useCallback(() => {
        if (interactionStart.current) {
            const endTime = performance.now();
            const latency = endTime - interactionStart.current;
            recordLatency(latency);
            interactionStart.current = undefined;
            return latency;
        }
        return 0;
    }, [recordLatency]);
    return {
        trackInteractionStart,
        trackInteractionEnd,
    };
};
export const useDragLatency = () => {
    const { recordLatency } = useLatencyBadge();
    const dragStart = useRef();
    const dragSamples = useRef([]);
    const startDrag = useCallback(() => {
        dragStart.current = performance.now();
        dragSamples.current = [];
    }, []);
    const updateDrag = useCallback(() => {
        if (dragStart.current) {
            const now = performance.now();
            const latency = now - dragStart.current;
            dragSamples.current.push(latency);
            if (dragSamples.current.length > 10) {
                dragSamples.current = dragSamples.current.slice(-10);
            }
        }
    }, []);
    const endDrag = useCallback(() => {
        if (dragStart.current && dragSamples.current.length > 0) {
            const avgLatency = dragSamples.current.reduce((a, b) => a + b, 0) / dragSamples.current.length;
            recordLatency(avgLatency);
            dragStart.current = undefined;
            dragSamples.current = [];
            return avgLatency;
        }
        return 0;
    }, [recordLatency]);
    return {
        startDrag,
        updateDrag,
        endDrag,
    };
};
//# sourceMappingURL=useLatencyBadge.js.map