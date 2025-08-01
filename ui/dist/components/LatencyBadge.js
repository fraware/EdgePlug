import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
export const LatencyBadge = ({ state, showMetrics = false, showDetails = false, className, size = 'md', variant = 'compact', }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const formatLatency = (latency) => {
        if (latency < 1)
            return `${Math.round(latency * 1000)}µs`;
        if (latency < 1000)
            return `${Math.round(latency)}ms`;
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
    const renderCompact = () => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: state.tier.name === 'Excellent' ? 'success' :
                    state.tier.name === 'Good' ? 'primary' :
                        state.tier.name === 'Fair' ? 'warning' :
                            state.tier.name === 'Poor' ? 'error' : 'error', size: size, className: cn('font-mono', state.isActive && 'animate-pulse'), children: formatLatency(state.currentLatency) }), state.isActive && (_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }))] }));
    const renderDetailed = () => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: state.tier.name === 'Excellent' ? 'success' :
                                    state.tier.name === 'Good' ? 'primary' :
                                        state.tier.name === 'Fair' ? 'warning' :
                                            state.tier.name === 'Poor' ? 'error' : 'error', size: size, className: "font-mono", children: formatLatency(state.currentLatency) }), _jsx("span", { className: cn('text-sm font-medium', state.tier.color), children: state.tier.name })] }), state.isActive && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-green-600", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { children: "Active" })] }))] }), showMetrics && (_jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Avg:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.avg) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "P95:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.p95) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Min:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.min) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Max:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.max) })] })] }))] }));
    const renderMinimal = () => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: cn('w-2 h-2 rounded-full', state.tier.bgColor.replace('bg-', 'bg-'), state.isActive && 'animate-pulse') }), _jsx("span", { className: cn('text-xs font-mono', state.tier.color), children: formatLatency(state.currentLatency) })] }));
    const renderExpandedDetails = () => (_jsx(AnimatePresence, { children: isExpanded && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "mt-2 p-3 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Performance Metrics" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Current:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.currentLatency) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Average:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.avg) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "P95:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.p95) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "P99:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.p99) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Min:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.min) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Max:" }), _jsx("span", { className: "ml-1 font-mono", children: formatLatency(state.metrics.max) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Samples:" }), _jsx("span", { className: "ml-1 font-mono", children: state.metrics.count })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Tier:" }), _jsx("span", { className: cn('ml-1 font-medium', state.tier.color), children: state.tier.name })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Performance Tiers" }), _jsx("div", { className: "space-y-1", children: [
                                    { name: 'Excellent', threshold: '≤50ms', color: 'text-green-700' },
                                    { name: 'Good', threshold: '≤100ms', color: 'text-blue-700' },
                                    { name: 'Fair', threshold: '≤200ms', color: 'text-yellow-700' },
                                    { name: 'Poor', threshold: '≤500ms', color: 'text-orange-700' },
                                    { name: 'Critical', threshold: '>500ms', color: 'text-red-700' },
                                ].map((tier) => (_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: cn(tier.color, tier.name === state.tier.name && 'font-bold'), children: tier.name }), _jsx("span", { className: "text-gray-500", children: tier.threshold })] }, tier.name))) })] })] }) })) }));
    return (_jsxs("div", { className: cn('inline-block', className), children: [_jsxs("div", { className: cn('cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors', getSizeClasses()), onClick: () => showDetails && setIsExpanded(!isExpanded), children: [variant === 'minimal' && renderMinimal(), variant === 'compact' && renderCompact(), variant === 'detailed' && renderDetailed()] }), showDetails && renderExpandedDetails()] }));
};
export const LatencyBadgeWithHook = ({ hookState, ...props }) => {
    return _jsx(LatencyBadge, { state: hookState.state, ...props });
};
export const PerformanceIndicator = ({ latency, tier, isActive = false, className }) => {
    const formatLatency = (latency) => {
        if (latency < 1)
            return `${Math.round(latency * 1000)}µs`;
        if (latency < 1000)
            return `${Math.round(latency)}ms`;
        return `${(latency / 1000).toFixed(1)}s`;
    };
    return (_jsxs("div", { className: cn('flex items-center gap-2', className), children: [_jsx("div", { className: cn('w-3 h-3 rounded-full', tier.bgColor, isActive && 'animate-pulse') }), _jsx("span", { className: cn('text-sm font-mono', tier.color), children: formatLatency(latency) }), isActive && (_jsx("div", { className: "w-1 h-1 bg-green-500 rounded-full animate-pulse" }))] }));
};
export const PerformanceChart = ({ metrics, className }) => {
    const maxValue = Math.max(metrics.max, 100);
    const getBarHeight = (value) => `${(value / maxValue) * 100}%`;
    return (_jsxs("div", { className: cn('flex items-end gap-1 h-20', className), children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Min" }), _jsx("div", { className: "w-4 bg-blue-200 rounded-t", style: { height: getBarHeight(metrics.min) } }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: [Math.round(metrics.min), "ms"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Avg" }), _jsx("div", { className: "w-4 bg-green-200 rounded-t", style: { height: getBarHeight(metrics.avg) } }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: [Math.round(metrics.avg), "ms"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "P95" }), _jsx("div", { className: "w-4 bg-yellow-200 rounded-t", style: { height: getBarHeight(metrics.p95) } }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: [Math.round(metrics.p95), "ms"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Max" }), _jsx("div", { className: "w-4 bg-red-200 rounded-t", style: { height: getBarHeight(metrics.max) } }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: [Math.round(metrics.max), "ms"] })] })] }));
};
//# sourceMappingURL=LatencyBadge.js.map