import { useState, useEffect, useCallback, useRef } from 'react';

// Types
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

// Latency tiers configuration
export const LATENCY_TIERS: LatencyTier[] = [
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

// Hook for tracking latency
export const useLatencyBadge = (options: {
  maxSamples?: number;
  updateInterval?: number;
  autoReset?: boolean;
  resetInterval?: number;
} = {}) => {
  const {
    maxSamples = 100,
    updateInterval = 1000,
    autoReset = true,
    resetInterval = 60000, // 1 minute
  } = options;

  const [state, setState] = useState<LatencyBadgeState>({
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

  const samples = useRef<number[]>([]);
  const lastUpdate = useRef<number>(Date.now());
  const resetTimer = useRef<NodeJS.Timeout>();

  // Calculate tier based on latency
  const getTier = useCallback((latency: number): LatencyTier => {
    for (const tier of LATENCY_TIERS) {
      if (latency <= tier.threshold) {
        return tier;
      }
    }
    return LATENCY_TIERS[LATENCY_TIERS.length - 1];
  }, []);

  // Calculate metrics from samples
  const calculateMetrics = useCallback((latencySamples: number[]): LatencyMetrics => {
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

  // Record a latency measurement
  const recordLatency = useCallback((latency: number) => {
    const now = Date.now();
    
    // Add sample
    samples.current.push(latency);
    
    // Keep only maxSamples
    if (samples.current.length > maxSamples) {
      samples.current = samples.current.slice(-maxSamples);
    }

    // Calculate metrics
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

  // Start tracking
  const startTracking = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Reset metrics
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

  // Auto-reset functionality
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
  }, [autoReset, resetInterval, resetMetrics]);

  // Update interval for continuous monitoring
  useEffect(() => {
    if (state.isActive && updateInterval > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate.current;
        
        // If no new measurements, gradually reduce the displayed latency
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

// Hook for measuring specific operations
export const useLatencyMeasurement = (operationName: string) => {
  const { recordLatency } = useLatencyBadge();
  const startTime = useRef<number>();

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

  const measureAsync = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    startMeasurement();
    try {
      const result = await operation();
      return result;
    } finally {
      endMeasurement();
    }
  }, [startMeasurement, endMeasurement]);

  const measureSync = useCallback(<T>(operation: () => T): T => {
    startMeasurement();
    try {
      const result = operation();
      return result;
    } finally {
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

// Hook for tracking user interactions
export const useInteractionLatency = () => {
  const { recordLatency } = useLatencyBadge();
  const interactionStart = useRef<number>();

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

// Hook for tracking drag operations
export const useDragLatency = () => {
  const { recordLatency } = useLatencyBadge();
  const dragStart = useRef<number>();
  const dragSamples = useRef<number[]>([]);

  const startDrag = useCallback(() => {
    dragStart.current = performance.now();
    dragSamples.current = [];
  }, []);

  const updateDrag = useCallback(() => {
    if (dragStart.current) {
      const now = performance.now();
      const latency = now - dragStart.current;
      dragSamples.current.push(latency);
      
      // Keep only last 10 samples for drag
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