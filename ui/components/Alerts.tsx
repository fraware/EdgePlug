import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';

// Types
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'security' | 'performance' | 'maintenance';
  timestamp: string;
  deviceId: string;
  deviceName: string;
  acknowledged: boolean;
  resolved: boolean;
  rootCause?: {
    type: 'hardware' | 'software' | 'network' | 'configuration';
    description: string;
    affectedComponents: string[];
    recommendations: string[];
  };
  metrics?: {
    cpu: number;
    memory: number;
    temperature: number;
    voltage: number;
  };
}

export interface AlertFilters {
  severity: string[];
  category: string[];
  status: 'all' | 'active' | 'acknowledged' | 'resolved';
  deviceId: string[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

// Alert Item Component
interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onViewDetails: (alert: Alert) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge, onResolve, onViewDetails }) => {
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">{severityIcons[alert.severity]}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{alert.title}</h3>
              <Badge variant={alert.severity} size="sm">
                {alert.severity}
              </Badge>
              <Badge variant="neutral" size="sm">
                {alert.category}
              </Badge>
            </div>
            <span className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{alert.message}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{alert.deviceName}</span>
              {alert.metrics && (
                <div className="flex items-center gap-2">
                  <span>CPU: {alert.metrics.cpu}%</span>
                  <span>Mem: {alert.metrics.memory}%</span>
                  <span>Temp: {alert.metrics.temperature}°C</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!alert.acknowledged && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
              {!alert.resolved && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onResolve(alert.id)}
                >
                  Resolve
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(alert)}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Alert Details Modal
interface AlertDetailsModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, isOpen, onClose }) => {
  if (!alert) return null;

  const renderRootCauseGraph = () => {
    if (!alert.rootCause) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Root Cause Analysis</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Type</h5>
              <Badge variant="neutral">{alert.rootCause.type}</Badge>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Description</h5>
              <p className="text-sm text-gray-600">{alert.rootCause.description}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2">Affected Components</h5>
            <div className="flex flex-wrap gap-2">
              {alert.rootCause.affectedComponents.map((component, index) => (
                <Badge key={index} variant="warning" size="sm">
                  {component}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2">Recommendations</h5>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {alert.rootCause.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    if (!alert.metrics) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">System Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{alert.metrics.cpu}%</div>
            <div className="text-sm text-blue-700">CPU Usage</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{alert.metrics.memory}%</div>
            <div className="text-sm text-green-700">Memory Usage</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{alert.metrics.temperature}°C</div>
            <div className="text-sm text-orange-700">Temperature</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{alert.metrics.voltage}V</div>
            <div className="text-sm text-purple-700">Voltage</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alert Details" size="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
          <p className="text-gray-600">{alert.message}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Device:</span>
            <span className="ml-2 text-gray-600">{alert.deviceName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Timestamp:</span>
            <span className="ml-2 text-gray-600">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Severity:</span>
            <Badge variant={alert.severity} size="sm" className="ml-2">
              {alert.severity}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <Badge variant="neutral" size="sm" className="ml-2">
              {alert.category}
            </Badge>
          </div>
        </div>
        
        {renderMetrics()}
        {renderRootCauseGraph()}
      </div>
    </Modal>
  );
};

// Alert Filters Component
interface AlertFiltersProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
}

const AlertFilters: React.FC<AlertFiltersProps> = ({ filters, onFiltersChange }) => {
  const severities = ['critical', 'warning', 'info', 'success'];
  const categories = ['system', 'security', 'performance', 'maintenance'];
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  const updateFilter = (key: keyof AlertFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
      
      {/* Severity */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Severity</h4>
        <div className="flex flex-wrap gap-2">
          {severities.map((severity) => (
            <label key={severity} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.severity.includes(severity)}
                onChange={(e) => {
                  const newSeverities = e.target.checked
                    ? [...filters.severity, severity]
                    : filters.severity.filter(s => s !== severity);
                  updateFilter('severity', newSeverities);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{severity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...filters.category, category]
                    : filters.category.filter(c => c !== category);
                  updateFilter('category', newCategories);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Alerts</option>
          <option value="active">Active Only</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Time Range */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Time Range</h4>
        <select
          value={filters.timeRange}
          onChange={(e) => updateFilter('timeRange', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Main Alerts Component
export interface AlertsProps {
  className?: string;
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve') => void;
}

export const Alerts: React.FC<AlertsProps> = ({ className, onAlertAction }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
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

  const [filters, setFilters] = useState<AlertFilters>({
    severity: [],
    category: [],
    status: 'all',
    deviceId: [],
    timeRange: '24h',
  });

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
        return false;
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(alert.category)) {
        return false;
      }

      // Status filter
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

      // Time range filter
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

  const handleAcknowledge = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    onAlertAction?.(alertId, 'acknowledge');
  }, [onAlertAction]);

  const handleResolve = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    onAlertAction?.(alertId, 'resolve');
  }, [onAlertAction]);

  const handleViewDetails = useCallback((alert: Alert) => {
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Alerts</h1>
        <p className="text-gray-600">Monitor and manage system alerts and notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{alertStats.total}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{alertStats.warning}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{alertStats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
      </div>

      {/* Filters and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AlertFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                <p className="text-gray-600">No alerts match your current filters</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <AlertDetailsModal
        alert={selectedAlert}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}; 