import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';
const AlertItem = ({ alert, onAcknowledge, onResolve, onViewDetails }) => {
    const severityColors = {
        critical: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
        success: 'bg-green-500 text-white',
    };
    const severityIcons = {
        critical: '🚨',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅',
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };
    return (_jsx(motion.div, { className: "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-2xl", children: severityIcons[alert.severity] }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-semibold text-gray-900 truncate", children: alert.title }), _jsx(Badge, { variant: alert.severity, size: "sm", children: alert.severity }), _jsx(Badge, { variant: "neutral", size: "sm", children: alert.category })] }), _jsx("span", { className: "text-sm text-gray-500", children: formatTimestamp(alert.timestamp) })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: alert.message }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-500", children: [_jsx("span", { children: alert.deviceName }), alert.metrics && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: ["CPU: ", alert.metrics.cpu, "%"] }), _jsxs("span", { children: ["Mem: ", alert.metrics.memory, "%"] }), _jsxs("span", { children: ["Temp: ", alert.metrics.temperature, "\u00B0C"] })] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [!alert.acknowledged && (_jsx(Button, { variant: "secondary", size: "sm", onClick: () => onAcknowledge(alert.id), children: "Acknowledge" })), !alert.resolved && (_jsx(Button, { variant: "primary", size: "sm", onClick: () => onResolve(alert.id), children: "Resolve" })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onViewDetails(alert), children: "Details" })] })] })] })] }) }));
};
const AlertDetailsModal = ({ alert, isOpen, onClose }) => {
    if (!alert)
        return null;
    const renderRootCauseGraph = () => {
        if (!alert.rootCause)
            return null;
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: "Root Cause Analysis" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "Type" }), _jsx(Badge, { variant: "neutral", children: alert.rootCause.type })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-gray-600", children: alert.rootCause.description })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "Affected Components" }), _jsx("div", { className: "flex flex-wrap gap-2", children: alert.rootCause.affectedComponents.map((component, index) => (_jsx(Badge, { variant: "warning", size: "sm", children: component }, index))) })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "Recommendations" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: alert.rootCause.recommendations.map((rec, index) => (_jsx("li", { children: rec }, index))) })] })] })] }));
    };
    const renderMetrics = () => {
        if (!alert.metrics)
            return null;
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: "System Metrics" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-3", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [alert.metrics.cpu, "%"] }), _jsx("div", { className: "text-sm text-blue-700", children: "CPU Usage" })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-3", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [alert.metrics.memory, "%"] }), _jsx("div", { className: "text-sm text-green-700", children: "Memory Usage" })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-3", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [alert.metrics.temperature, "\u00B0C"] }), _jsx("div", { className: "text-sm text-orange-700", children: "Temperature" })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-3", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [alert.metrics.voltage, "V"] }), _jsx("div", { className: "text-sm text-purple-700", children: "Voltage" })] })] })] }));
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Alert Details", size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: alert.title }), _jsx("p", { className: "text-gray-600", children: alert.message })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Device:" }), _jsx("span", { className: "ml-2 text-gray-600", children: alert.deviceName })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Timestamp:" }), _jsx("span", { className: "ml-2 text-gray-600", children: new Date(alert.timestamp).toLocaleString() })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Severity:" }), _jsx(Badge, { variant: alert.severity, size: "sm", className: "ml-2", children: alert.severity })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Category:" }), _jsx(Badge, { variant: "neutral", size: "sm", className: "ml-2", children: alert.category })] })] }), renderMetrics(), renderRootCauseGraph()] }) }));
};
const AlertFilters = ({ filters, onFiltersChange }) => {
    const severities = ['critical', 'warning', 'info', 'success'];
    const categories = ['system', 'security', 'performance', 'maintenance'];
    const timeRanges = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
    ];
    const updateFilter = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Filters" }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Severity" }), _jsx("div", { className: "flex flex-wrap gap-2", children: severities.map((severity) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.severity.includes(severity), onChange: (e) => {
                                        const newSeverities = e.target.checked
                                            ? [...filters.severity, severity]
                                            : filters.severity.filter(s => s !== severity);
                                        updateFilter('severity', newSeverities);
                                    }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 capitalize", children: severity })] }, severity))) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.category.includes(category), onChange: (e) => {
                                        const newCategories = e.target.checked
                                            ? [...filters.category, category]
                                            : filters.category.filter(c => c !== category);
                                        updateFilter('category', newCategories);
                                    }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 capitalize", children: category })] }, category))) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => updateFilter('status', e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Alerts" }), _jsx("option", { value: "active", children: "Active Only" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" }), _jsx("option", { value: "resolved", children: "Resolved" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Time Range" }), _jsx("select", { value: filters.timeRange, onChange: (e) => updateFilter('timeRange', e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", children: timeRanges.map((range) => (_jsx("option", { value: range.value, children: range.label }, range.value))) })] })] }));
};
export const Alerts = ({ className, onAlertAction }) => {
    const [alerts, setAlerts] = useState([
        {
            id: '1',
            title: 'High CPU Usage Detected',
            message: 'CPU usage has exceeded 90% for more than 5 minutes on device PLC-001',
            severity: 'warning',
            category: 'performance',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            deviceId: 'plc-001',
            deviceName: 'PLC-001',
            acknowledged: false,
            resolved: false,
            metrics: {
                cpu: 95,
                memory: 78,
                temperature: 65,
                voltage: 230,
            },
            rootCause: {
                type: 'software',
                description: 'Background process consuming excessive CPU resources',
                affectedComponents: ['Data Processing Module', 'Network Interface'],
                recommendations: [
                    'Restart the data processing service',
                    'Check for memory leaks in background processes',
                    'Consider upgrading system resources',
                ],
            },
        },
        {
            id: '2',
            title: 'Network Connection Lost',
            message: 'Device PLC-002 has lost connection to the main network',
            severity: 'critical',
            category: 'system',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            deviceId: 'plc-002',
            deviceName: 'PLC-002',
            acknowledged: true,
            resolved: false,
        },
        {
            id: '3',
            title: 'Temperature Threshold Exceeded',
            message: 'Temperature sensor reading 85°C, exceeding safe operating limits',
            severity: 'critical',
            category: 'maintenance',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            deviceId: 'transformer-001',
            deviceName: 'Transformer-001',
            acknowledged: false,
            resolved: false,
            metrics: {
                cpu: 45,
                memory: 62,
                temperature: 85,
                voltage: 400,
            },
        },
    ]);
    const [filters, setFilters] = useState({
        severity: [],
        category: [],
        status: 'all',
        deviceId: [],
        timeRange: '24h',
    });
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const filteredAlerts = useMemo(() => {
        return alerts.filter((alert) => {
            if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
                return false;
            }
            if (filters.category.length > 0 && !filters.category.includes(alert.category)) {
                return false;
            }
            if (filters.status !== 'all') {
                if (filters.status === 'active' && (alert.acknowledged || alert.resolved)) {
                    return false;
                }
                if (filters.status === 'acknowledged' && !alert.acknowledged) {
                    return false;
                }
                if (filters.status === 'resolved' && !alert.resolved) {
                    return false;
                }
            }
            const alertTime = new Date(alert.timestamp).getTime();
            const now = Date.now();
            const timeRanges = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000,
            };
            if (now - alertTime > timeRanges[filters.timeRange]) {
                return false;
            }
            return true;
        });
    }, [alerts, filters]);
    const handleAcknowledge = useCallback((alertId) => {
        setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, acknowledged: true } : alert));
        onAlertAction?.(alertId, 'acknowledge');
    }, [onAlertAction]);
    const handleResolve = useCallback((alertId) => {
        setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, resolved: true } : alert));
        onAlertAction?.(alertId, 'resolve');
    }, [onAlertAction]);
    const handleViewDetails = useCallback((alert) => {
        setSelectedAlert(alert);
        setIsDetailsModalOpen(true);
    }, []);
    const alertStats = useMemo(() => {
        const total = alerts.length;
        const critical = alerts.filter(a => a.severity === 'critical').length;
        const warning = alerts.filter(a => a.severity === 'warning').length;
        const active = alerts.filter(a => !a.resolved).length;
        return { total, critical, warning, active };
    }, [alerts]);
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Alerts" }), _jsx("p", { className: "text-gray-600", children: "Monitor and manage system alerts and notifications" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: alertStats.total }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Alerts" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: alertStats.critical }), _jsx("div", { className: "text-sm text-gray-600", children: "Critical" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: alertStats.warning }), _jsx("div", { className: "text-sm text-gray-600", children: "Warnings" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: alertStats.active }), _jsx("div", { className: "text-sm text-gray-600", children: "Active" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(AlertFilters, { filters: filters, onFiltersChange: setFilters }) }), _jsx("div", { className: "lg:col-span-3", children: _jsx("div", { className: "space-y-4", children: filteredAlerts.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-gray-400 text-6xl mb-4", children: "\uD83D\uDD14" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No alerts found" }), _jsx("p", { className: "text-gray-600", children: "No alerts match your current filters" })] })) : (_jsx(AnimatePresence, { children: filteredAlerts.map((alert) => (_jsx(AlertItem, { alert: alert, onAcknowledge: handleAcknowledge, onResolve: handleResolve, onViewDetails: handleViewDetails }, alert.id))) })) }) })] }), _jsx(AlertDetailsModal, { alert: selectedAlert, isOpen: isDetailsModalOpen, onClose: () => setIsDetailsModalOpen(false) })] }));
};
//# sourceMappingURL=Alerts.js.map