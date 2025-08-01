import React from 'react';
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
export interface AlertsProps {
    className?: string;
    onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve') => void;
}
export declare const Alerts: React.FC<AlertsProps>;
//# sourceMappingURL=Alerts.d.ts.map