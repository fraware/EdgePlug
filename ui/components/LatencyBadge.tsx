import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { useLatencyBadge, LatencyBadgeState, LatencyTier } from '../hooks/useLatencyBadge';

// Types
export interface LatencyBadgeProps {
  state: LatencyBadgeState;
  showMetrics?: boolean;
  showDetails?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed' | 'minimal';
}

// Latency Badge Component
export const LatencyBadge: React.FC<LatencyBadgeProps> = ({
  state,
  showMetrics = false,
  showDetails = false,
  className,
  size = 'md',
  variant = 'compact',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatLatency = (latency: number): string => {
    if (latency < 1) return `${Math.round(latency * 1000)}µs`;
    if (latency < 1000) return `${Math.round(latency)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const renderCompact = () => (
    <div className="flex items-center gap-2">
      <Badge
        variant={
          state.tier.name === 'Excellent' ? 'success' :
          state.tier.name === 'Good' ? 'primary' :
          state.tier.name === 'Fair' ? 'warning' :
          state.tier.name === 'Poor' ? 'error' : 'error'
        }
        size={size}
        className={cn(
          'font-mono',
          state.isActive && 'animate-pulse'
        )}
      >
        {formatLatency(state.currentLatency)}
      </Badge>
      {state.isActive && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              state.tier.name === 'Excellent' ? 'success' :
              state.tier.name === 'Good' ? 'primary' :
              state.tier.name === 'Fair' ? 'warning' :
              state.tier.name === 'Poor' ? 'error' : 'error'
            }
            size={size}
            className="font-mono"
          >
            {formatLatency(state.currentLatency)}
          </Badge>
          <span className={cn('text-sm font-medium', state.tier.color)}>
            {state.tier.name}
          </span>
        </div>
        {state.isActive && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Active</span>
          </div>
        )}
      </div>

      {showMetrics && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Avg:</span>
            <span className="ml-1 font-mono">{formatLatency(state.metrics.avg)}</span>
          </div>
          <div>
            <span className="text-gray-500">P95:</span>
            <span className="ml-1 font-mono">{formatLatency(state.metrics.p95)}</span>
          </div>
          <div>
            <span className="text-gray-500">Min:</span>
            <span className="ml-1 font-mono">{formatLatency(state.metrics.min)}</span>
          </div>
          <div>
            <span className="text-gray-500">Max:</span>
            <span className="ml-1 font-mono">{formatLatency(state.metrics.max)}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          state.tier.bgColor.replace('bg-', 'bg-'),
          state.isActive && 'animate-pulse'
        )}
      />
      <span className={cn('text-xs font-mono', state.tier.color)}>
        {formatLatency(state.currentLatency)}
      </span>
    </div>
  );

  const renderExpandedDetails = () => (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 p-3 bg-gray-50 rounded-lg"
        >
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Current:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.currentLatency)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Average:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.metrics.avg)}</span>
                </div>
                <div>
                  <span className="text-gray-500">P95:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.metrics.p95)}</span>
                </div>
                <div>
                  <span className="text-gray-500">P99:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.metrics.p99)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Min:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.metrics.min)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Max:</span>
                  <span className="ml-1 font-mono">{formatLatency(state.metrics.max)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Samples:</span>
                  <span className="ml-1 font-mono">{state.metrics.count}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tier:</span>
                  <span className={cn('ml-1 font-medium', state.tier.color)}>
                    {state.tier.name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Tiers</h4>
              <div className="space-y-1">
                {[
                  { name: 'Excellent', threshold: '≤50ms', color: 'text-green-700' },
                  { name: 'Good', threshold: '≤100ms', color: 'text-blue-700' },
                  { name: 'Fair', threshold: '≤200ms', color: 'text-yellow-700' },
                  { name: 'Poor', threshold: '≤500ms', color: 'text-orange-700' },
                  { name: 'Critical', threshold: '>500ms', color: 'text-red-700' },
                ].map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between text-xs">
                    <span className={cn(tier.color, tier.name === state.tier.name && 'font-bold')}>
                      {tier.name}
                    </span>
                    <span className="text-gray-500">{tier.threshold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn('inline-block', className)}>
      <div
        className={cn(
          'cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors',
          getSizeClasses()
        )}
        onClick={() => showDetails && setIsExpanded(!isExpanded)}
      >
        {variant === 'minimal' && renderMinimal()}
        {variant === 'compact' && renderCompact()}
        {variant === 'detailed' && renderDetailed()}
      </div>
      
      {showDetails && renderExpandedDetails()}
    </div>
  );
};

// Hook wrapper component
export const LatencyBadgeWithHook: React.FC<{
  hookState: ReturnType<typeof useLatencyBadge>;
  showMetrics?: boolean;
  showDetails?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed' | 'minimal';
}> = ({ hookState, ...props }) => {
  return <LatencyBadge state={hookState.state} {...props} />;
};

// Performance indicator component
export const PerformanceIndicator: React.FC<{
  latency: number;
  tier: LatencyTier;
  isActive?: boolean;
  className?: string;
}> = ({ latency, tier, isActive = false, className }) => {
  const formatLatency = (latency: number): string => {
    if (latency < 1) return `${Math.round(latency * 1000)}µs`;
    if (latency < 1000) return `${Math.round(latency)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          tier.bgColor,
          isActive && 'animate-pulse'
        )}
      />
      <span className={cn('text-sm font-mono', tier.color)}>
        {formatLatency(latency)}
      </span>
      {isActive && (
        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

// Performance chart component
export const PerformanceChart: React.FC<{
  metrics: LatencyBadgeState['metrics'];
  className?: string;
}> = ({ metrics, className }) => {
  const maxValue = Math.max(metrics.max, 100); // Ensure we have a reasonable scale
  const getBarHeight = (value: number) => `${(value / maxValue) * 100}%`;

  return (
    <div className={cn('flex items-end gap-1 h-20', className)}>
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-1">Min</div>
        <div className="w-4 bg-blue-200 rounded-t" style={{ height: getBarHeight(metrics.min) }} />
        <div className="text-xs text-gray-600 mt-1">{Math.round(metrics.min)}ms</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-1">Avg</div>
        <div className="w-4 bg-green-200 rounded-t" style={{ height: getBarHeight(metrics.avg) }} />
        <div className="text-xs text-gray-600 mt-1">{Math.round(metrics.avg)}ms</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-1">P95</div>
        <div className="w-4 bg-yellow-200 rounded-t" style={{ height: getBarHeight(metrics.p95) }} />
        <div className="text-xs text-gray-600 mt-1">{Math.round(metrics.p95)}ms</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-1">Max</div>
        <div className="w-4 bg-red-200 rounded-t" style={{ height: getBarHeight(metrics.max) }} />
        <div className="text-xs text-gray-600 mt-1">{Math.round(metrics.max)}ms</div>
      </div>
    </div>
  );
}; 