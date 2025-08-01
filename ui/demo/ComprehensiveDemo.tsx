import React, { useState } from 'react';
import { Canvas } from '../components/Canvas';
import { Marketplace } from '../components/Marketplace';
import { Alerts } from '../components/Alerts';
import { DiffPreview } from '../components/DiffPreview';
import { LatencyBadge, LatencyBadgeWithHook } from '../components/LatencyBadge';
import { useLatencyBadge, useLatencyMeasurement, useDragLatency } from '../hooks/useLatencyBadge';
import { validateAgentManifestSafe } from '../schema/edgeplug';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

const ComprehensiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'marketplace' | 'alerts' | 'validation' | 'latency'>('canvas');
  
  // Latency tracking hooks
  const latencyHook = useLatencyBadge();
  const measurementHook = useLatencyMeasurement('demo-operation');
  const dragHook = useDragLatency();

  // Sample data for demonstrations
  const sampleManifest = {
    identity: {
      id: 'voltage-monitor-v1',
      name: 'Voltage Monitor Agent',
      version: '1.0.0',
      description: 'Monitors voltage levels and triggers alerts',
    },
    vendor: {
      name: 'EdgePlug Inc',
      email: 'support@edgeplug.com',
      website: 'https://edgeplug.com',
    },
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      releaseDate: '2024-01-15T00:00:00Z',
    },
    compatibility: {
      platform: 'STM32F4',
      minFlashSize: 32768,
      minRamSize: 4096,
      maxInferenceTime: 500,
      supportedProtocols: ['OPC_UA', 'MODBUS_RTU', 'GPIO'],
    },
    safety: {
      level: 'SL3',
      bounds: {
        inputValidation: [
          {
            fieldName: 'voltage',
            dataType: 'FLOAT32',
            required: true,
            range: { min: 0, max: 1000 },
          },
        ],
        outputConstraints: [
          {
            fieldName: 'alert',
            dataType: 'BOOLEAN',
          },
        ],
        failSafeBehavior: 'STOP',
        recoveryStrategy: 'AUTOMATIC',
      },
      invariants: [
        {
          id: 'voltage-range',
          description: 'Voltage must be within safe range',
          severity: 'HIGH',
          condition: 'voltage >= 0 AND voltage <= 1000',
        },
      ],
      failSafe: {
        action: 'STOP',
        timeout: 5000,
        retryCount: 3,
      },
      recovery: {
        strategy: 'AUTOMATIC',
        backoffStrategy: {
          initialDelay: 1000,
          maxDelay: 30000,
          multiplier: 2,
          maxAttempts: 5,
        },
      },
      notifications: {
        channels: [
          {
            type: 'EMAIL',
            endpoint: 'https://api.edgeplug.com/notify',
          },
        ],
        levels: ['WARNING', 'ERROR', 'CRITICAL'],
        schedule: {
          enabled: true,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC',
        },
      },
    },
    resources: {
      memory: {
        flashSize: 32768,
        ramSize: 4096,
        stackSize: 2048,
        heapSize: 1024,
      },
      cpu: {
        minFrequency: 168000000,
        maxInferenceTime: 500,
        maxConcurrentTasks: 4,
      },
      storage: {
        minSize: 1024,
        maxSize: 8192,
        fileSystem: 'FAT32',
      },
      network: {
        bandwidth: 1000000,
        latency: 100,
        protocols: ['HTTP', 'MQTT'],
      },
      power: {
        voltage: 3.3,
        current: 0.1,
        powerMode: 'ACTIVE',
      },
    },
    signature: {
      algorithm: 'ED25519',
      scope: 'FULL',
      signature: 'abc123...',
      publicKey: 'def456...',
      timestamp: '2024-01-15T00:00:00Z',
      signer: 'EdgePlug Inc',
    },
    deployment: {
      mode: 'SINGLE',
      replicas: 1,
      updateStrategy: {
        type: 'IMMEDIATE',
      },
      rollbackConfig: {
        enabled: true,
        triggers: [
          {
            type: 'ERROR_RATE',
            threshold: 0.05,
            duration: 300,
          },
        ],
        automatic: true,
        timeout: 30000,
      },
      healthCheck: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1,
      },
      successCriteria: {
        metrics: ['accuracy', 'latency'],
        thresholds: { accuracy: 0.95, latency: 500 },
        evaluationPeriod: 300,
      },
    },
    monitoring: {
      metrics: {
        enabled: true,
        interval: 60000,
        customMetrics: [
          {
            name: 'voltage_reading',
            type: 'GAUGE',
            description: 'Current voltage reading',
            unit: 'V',
          },
        ],
        retention: 86400,
      },
      logging: {
        level: 'INFO',
        format: 'JSON',
        output: 'STDOUT',
      },
      alerting: {
        enabled: true,
        rules: [
          {
            name: 'high_voltage',
            description: 'Voltage exceeds threshold',
            severity: 'HIGH',
            condition: 'voltage > 400',
            duration: 60,
          },
        ],
        grouping: {
          enabled: true,
          groupBy: ['device_id'],
          interval: 300,
        },
        notificationChannels: [
          {
            type: 'EMAIL',
            endpoint: 'https://api.edgeplug.com/notify',
          },
        ],
      },
      tracing: {
        enabled: true,
        samplingRate: 0.1,
        customSpans: [],
        propagation: 'W3C',
      },
    },
    limits: {
      cpu: {
        requests: 0.1,
        limits: 0.5,
      },
      memory: {
        requests: 4096,
        limits: 8192,
      },
      storage: {
        requests: 1024,
        limits: 8192,
      },
      network: {
        bandwidth: 1000000,
        connections: 100,
      },
    },
  };

  const invalidManifest = {
    identity: {
      id: '', // Invalid: empty ID
      name: 'Invalid Agent',
      version: 'invalid-version', // Invalid: not semver
    },
    // Missing required fields
  };

  const [oldData, setOldData] = useState(sampleManifest);
  const [newData, setNewData] = useState({
    ...sampleManifest,
    identity: {
      ...sampleManifest.identity,
      version: '1.1.0',
      description: 'Updated voltage monitoring agent with enhanced safety features',
    },
    safety: {
      ...sampleManifest.safety,
      level: 'SL4',
      bounds: {
        ...sampleManifest.safety.bounds,
        inputValidation: [
          ...sampleManifest.safety.bounds.inputValidation,
          {
            fieldName: 'temperature',
            dataType: 'FLOAT32',
            required: true,
            range: { min: -40, max: 85 },
          },
        ],
      },
    },
  });

  const handleCanvasNodeSelect = (node: any) => {
    console.log('Canvas node selected:', node);
    measurementHook.measureSync(() => {
      // Simulate node selection processing
      return { success: true };
    });
  };

  const handleMarketplaceItemSelect = (item: any) => {
    console.log('Marketplace item selected:', item);
    measurementHook.measureAsync(async () => {
      // Simulate async marketplace item processing
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true };
    });
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    console.log('Alert action:', action, 'for alert:', alertId);
    measurementHook.recordLatency(measurementHook.endMeasurement());
  };

  const handleDiffClick = (path: string[], change: any) => {
    console.log('Diff clicked:', path, change);
  };

  const simulateLatencyTest = () => {
    // Simulate various latency scenarios
    const latencies = [25, 75, 150, 350, 750];
    latencies.forEach((latency, index) => {
      setTimeout(() => {
        latencyHook.recordLatency(latency);
      }, index * 1000);
    });
  };

  const simulateDragTest = () => {
    dragHook.startDrag();
    
    // Simulate drag updates
    const interval = setInterval(() => {
      dragHook.updateDrag();
    }, 16); // ~60fps

    // End drag after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      dragHook.endDrag();
    }, 2000);
  };

  const validateManifest = () => {
    const result = validateAgentManifestSafe(sampleManifest);
    console.log('Valid manifest result:', result);
    
    const invalidResult = validateAgentManifestSafe(invalidManifest);
    console.log('Invalid manifest result:', invalidResult);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EdgePlug UI Framework Demo</h1>
          <p className="text-gray-600">Comprehensive demonstration of D06-D09 deliverables</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'canvas', label: 'Canvas (D06)', icon: '🎨' },
            { id: 'marketplace', label: 'Marketplace (D07)', icon: '🛒' },
            { id: 'alerts', label: 'Alerts (D07)', icon: '🚨' },
            { id: 'validation', label: 'Validation (D08)', icon: '✅' },
            { id: 'latency', label: 'Latency (D09)', icon: '⚡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Latency Badge (Always visible) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Performance Monitor:</span>
            <LatencyBadgeWithHook hookState={latencyHook} showMetrics variant="detailed" />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={simulateLatencyTest} size="sm">
              Test Latency
            </Button>
            <Button onClick={simulateDragTest} size="sm">
              Test Drag
            </Button>
            <Button onClick={validateManifest} size="sm">
              Validate Manifest
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border min-h-[600px]">
          {activeTab === 'canvas' && (
            <div className="h-[600px]">
              <Canvas onNodeSelect={handleCanvasNodeSelect} />
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="p-6">
              <Marketplace onItemSelect={handleMarketplaceItemSelect} />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <Alerts onAlertAction={handleAlertAction} />
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Validation Demo</h2>
                <p className="text-gray-600 mb-4">
                  This demonstrates the zod schema validation and JSON diff functionality.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Schema Validation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">Valid</Badge>
                      <span className="text-sm">Sample manifest passes validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="error" size="sm">Invalid</Badge>
                      <span className="text-sm">Invalid manifest fails gracefully</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">JSON Diff Preview</h3>
                  <DiffPreview
                    oldData={oldData}
                    newData={newData}
                    showUnchanged={false}
                    onDiffClick={handleDiffClick}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'latency' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Monitoring Demo</h2>
                <p className="text-gray-600 mb-4">
                  Real-time latency tracking with color-coded performance tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Current Performance</h3>
                  <LatencyBadge state={latencyHook.state} showMetrics variant="detailed" />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Minimal View</h3>
                  <LatencyBadge state={latencyHook.state} variant="minimal" />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Compact View</h3>
                  <LatencyBadge state={latencyHook.state} variant="compact" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Performance Tiers</h3>
                <div className="grid grid-cols-5 gap-4 text-center">
                  {[
                    { name: 'Excellent', threshold: '≤50ms', color: 'text-green-700', bg: 'bg-green-100' },
                    { name: 'Good', threshold: '≤100ms', color: 'text-blue-700', bg: 'bg-blue-100' },
                    { name: 'Fair', threshold: '≤200ms', color: 'text-yellow-700', bg: 'bg-yellow-100' },
                    { name: 'Poor', threshold: '≤500ms', color: 'text-orange-700', bg: 'bg-orange-100' },
                    { name: 'Critical', threshold: '>500ms', color: 'text-red-700', bg: 'bg-red-100' },
                  ].map((tier) => (
                    <div key={tier.name} className={`p-3 rounded-lg ${tier.bg}`}>
                      <div className={`font-medium ${tier.color}`}>{tier.name}</div>
                      <div className="text-xs text-gray-600">{tier.threshold}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Summary */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Implemented Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">D06 - Canvas</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• React Flow integration</li>
                <li>• Custom node types (PLC, Transformer, Breaker)</li>
                <li>• Drag-and-drop toolbox</li>
                <li>• Signal mapping drawer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">D07 - Marketplace & Alerts</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Algolia-powered search</li>
                <li>• Virtualized tables</li>
                <li>• Alert timeline with severity</li>
                <li>• Root-cause analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">D08 - Validation</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Complete zod schemas</li>
                <li>• JSON diff preview</li>
                <li>• Form validation</li>
                <li>• Contract testing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">D09 - Latency</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time latency tracking</li>
                <li>• Color-coded performance tiers</li>
                <li>• Performance metrics</li>
                <li>• OpenTelemetry ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ComprehensiveDemo; 