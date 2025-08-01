import React, { useState } from 'react';
import { Button, Badge, Modal, Drawer, Toast } from './index';

// Wireframe Components for D02 - Low-Fidelity Wireframes

// ============================================================================
// 1. CANVAS WORKSPACE WIREFRAME
// ============================================================================

interface CanvasWireframeProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const CanvasWireframe: React.FC<CanvasWireframeProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showAgentLibrary, setShowAgentLibrary] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [showDeploymentPanel, setShowDeploymentPanel] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
          <span className="text-lg font-semibold">EdgePlug</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAssetLibrary(true)}
          >
            Assets
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAgentLibrary(true)}
          >
            Agents
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowDeploymentPanel(true)}
          >
            Deploy
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Asset Library */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Asset Library</h3>
          <div className="space-y-2">
            <div className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <div className="w-6 h-6 bg-blue-500 rounded mb-2"></div>
              <span className="text-sm">PLC Controller</span>
            </div>
            <div className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <div className="w-6 h-6 bg-green-500 rounded mb-2"></div>
              <span className="text-sm">Voltage Sensor</span>
            </div>
            <div className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <div className="w-6 h-6 bg-orange-500 rounded mb-2"></div>
              <span className="text-sm">Circuit Breaker</span>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-300 rounded mb-4 mx-auto"></div>
              <p className="text-lg font-medium">Canvas Workspace</p>
              <p className="text-sm">Drag assets here to build your configuration</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Property Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Device Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter device name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Protocol</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>OPC-UA</option>
                <option>Modbus RTU</option>
                <option>Modbus TCP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IP Address</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="192.168.1.100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Deployment Panel */}
      {showDeploymentPanel && (
        <div className="h-32 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Deployment Configuration</h3>
              <p className="text-sm text-gray-600">Ready to deploy 3 devices</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">Cancel</Button>
              <Button variant="primary" size="sm">Deploy Now</Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate?.('marketplace')}
        >
          Marketplace
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate?.('fleet')}
        >
          Fleet
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate?.('alerts')}
        >
          Alerts
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. MARKETPLACE WIREFRAME
// ============================================================================

interface MarketplaceWireframeProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const MarketplaceWireframe: React.FC<MarketplaceWireframeProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
          <span className="text-lg font-semibold">EdgePlug Marketplace</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.('canvas')}
          >
            Canvas
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.('fleet')}
          >
            Fleet
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="p-3 border border-gray-300 rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="voltage">Voltage Monitoring</option>
            <option value="current">Current Monitoring</option>
            <option value="power">Power Quality</option>
          </select>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agent Card 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded"></div>
              <Badge variant="success" size="sm">Certified</Badge>
            </div>
            <h3 className="font-semibold mb-2">Voltage Event Detector</h3>
            <p className="text-sm text-gray-600 mb-3">
              Detects voltage sags, swells, and interruptions in real-time
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">$29/month</span>
              <Button variant="primary" size="sm">Install</Button>
            </div>
          </div>

          {/* Agent Card 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500 rounded"></div>
              <Badge variant="warning" size="sm">Beta</Badge>
            </div>
            <h3 className="font-semibold mb-2">Power Quality Analyzer</h3>
            <p className="text-sm text-gray-600 mb-3">
              Comprehensive power quality analysis with harmonics detection
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">$49/month</span>
              <Button variant="primary" size="sm">Install</Button>
            </div>
          </div>

          {/* Agent Card 3 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded"></div>
              <Badge variant="neutral" size="sm">Free</Badge>
            </div>
            <h3 className="font-semibold mb-2">Current Monitor</h3>
            <p className="text-sm text-gray-600 mb-3">
              Basic current monitoring with overload protection
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Free</span>
              <Button variant="primary" size="sm">Install</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. FLEET MANAGEMENT WIREFRAME
// ============================================================================

interface FleetWireframeProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const FleetWireframe: React.FC<FleetWireframeProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
          <span className="text-lg font-semibold">Fleet Management</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('canvas')}>
            Canvas
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('marketplace')}>
            Marketplace
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24</div>
            <div className="text-sm text-gray-600">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-gray-600">Offline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <div className="text-sm text-gray-600">Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">Updates</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Device List */}
        <div className="w-96 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Devices</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {[
              { id: '1', name: 'PLC-001', status: 'online', location: 'Substation A' },
              { id: '2', name: 'PLC-002', status: 'online', location: 'Substation A' },
              { id: '3', name: 'PLC-003', status: 'offline', location: 'Substation B' },
              { id: '4', name: 'PLC-004', status: 'online', location: 'Substation B' },
              { id: '5', name: 'PLC-005', status: 'alert', location: 'Substation C' },
            ].map((device) => (
              <div
                key={device.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedDevice === device.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedDevice(device.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-600">{device.location}</div>
                  </div>
                  <Badge 
                    variant={device.status === 'online' ? 'success' : 
                           device.status === 'offline' ? 'error' : 'warning'}
                    size="sm"
                  >
                    {device.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Details */}
        <div className="flex-1 p-6">
          {selectedDevice ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Device Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device ID</label>
                    <p className="text-sm text-gray-900">PLC-{selectedDevice}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <Badge variant="success" size="sm">Online</Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">Substation A</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Update</label>
                    <p className="text-sm text-gray-900">2 minutes ago</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2.3ms</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">15</div>
                    <div className="text-sm text-gray-600">Alerts Today</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded mb-4 mx-auto"></div>
                <p className="text-lg font-medium">Select a device</p>
                <p className="text-sm">Choose a device from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. ALERTS & MONITORING WIREFRAME
// ============================================================================

interface AlertsWireframeProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const AlertsWireframe: React.FC<AlertsWireframeProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
          <span className="text-lg font-semibold">Alerts & Monitoring</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('canvas')}>
            Canvas
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('fleet')}>
            Fleet
          </Button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">5</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <div className="text-sm text-gray-600">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600">Info</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">25</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Alert List */}
        <div className="w-96 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Recent Alerts</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {[
              { 
                id: '1', 
                title: 'Voltage Sag Detected', 
                severity: 'critical', 
                device: 'PLC-001',
                time: '2 minutes ago'
              },
              { 
                id: '2', 
                title: 'High Current Warning', 
                severity: 'warning', 
                device: 'PLC-002',
                time: '5 minutes ago'
              },
              { 
                id: '3', 
                title: 'Device Offline', 
                severity: 'critical', 
                device: 'PLC-003',
                time: '10 minutes ago'
              },
              { 
                id: '4', 
                title: 'Performance Degraded', 
                severity: 'warning', 
                device: 'PLC-004',
                time: '15 minutes ago'
              },
            ].map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedAlert === alert.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedAlert(alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-600">{alert.device}</div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                  <Badge 
                    variant={alert.severity === 'critical' ? 'error' : 'warning'}
                    size="sm"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Details */}
        <div className="flex-1 p-6">
          {selectedAlert ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Voltage Sag Detected</h3>
                  <Badge variant="error" size="sm">Critical</Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device</label>
                    <p className="text-sm text-gray-900">PLC-001</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-sm text-gray-900">2024-01-15 14:32:15</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">
                      Voltage dropped below 90% of nominal for 2.5 seconds. 
                      This may indicate a power quality issue or equipment malfunction.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Actions</label>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="primary" size="sm">Acknowledge</Button>
                      <Button variant="secondary" size="sm">Investigate</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Related Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Voltage</label>
                    <p className="text-2xl font-bold text-red-600">87.2V</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current</label>
                    <p className="text-2xl font-bold text-gray-900">15.3A</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded mb-4 mx-auto"></div>
                <p className="text-lg font-medium">Select an alert</p>
                <p className="text-sm">Choose an alert from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. DOCUMENTATION WIREFRAME
// ============================================================================

interface DocumentationWireframeProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const DocumentationWireframe: React.FC<DocumentationWireframeProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
          <span className="text-lg font-semibold">Documentation</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('canvas')}>
            Canvas
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('marketplace')}>
            Marketplace
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search documentation..."
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Documentation</h3>
          <nav className="space-y-2">
            <a href="#" className="block p-2 text-blue-600 bg-blue-50 rounded">Getting Started</a>
            <a href="#" className="block p-2 text-gray-600 hover:bg-gray-50 rounded">Installation</a>
            <a href="#" className="block p-2 text-gray-600 hover:bg-gray-50 rounded">Configuration</a>
            <a href="#" className="block p-2 text-gray-600 hover:bg-gray-50 rounded">API Reference</a>
            <a href="#" className="block p-2 text-gray-600 hover:bg-gray-50 rounded">Troubleshooting</a>
            <a href="#" className="block p-2 text-gray-600 hover:bg-gray-50 rounded">Examples</a>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Getting Started with EdgePlug</h1>
            
            <div className="prose prose-lg">
              <p className="text-gray-600 mb-6">
                Welcome to EdgePlug, the industrial automation platform that brings machine learning 
                to your PLC infrastructure. This guide will help you get started with deploying 
                your first ML agent.
              </p>

              <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Connect your PLC device to the network</li>
                  <li>Create a new configuration in the Canvas</li>
                  <li>Install an agent from the Marketplace</li>
                  <li>Configure the agent parameters</li>
                  <li>Deploy to your device</li>
                </ol>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>PLC device with network connectivity</li>
                <li>EdgePlug runtime installed</li>
                <li>Valid EdgePlug account</li>
                <li>Supported protocol (OPC-UA, Modbus)</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Installation Guide</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn how to install EdgePlug runtime on your PLC device.
                  </p>
                  <Button variant="primary" size="sm">Read More</Button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Configuration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure your first ML agent deployment.
                  </p>
                  <Button variant="primary" size="sm">Read More</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. SECONDARY MODALS WIREFRAMES
// ============================================================================

// Agent Configuration Modal
export const AgentConfigurationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Agent" size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Model Parameters</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">Threshold</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Window Size</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Safety Invariants</label>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
            placeholder="Enter safety constraints..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Save Configuration</Button>
        </div>
      </div>
    </Modal>
  );
};

// Device Connection Modal
export const DeviceConnectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Device" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Connection Type</label>
          <select className="w-full p-2 border border-gray-300 rounded">
            <option>OPC-UA</option>
            <option>Modbus RTU</option>
            <option>Modbus TCP</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">IP Address</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="192.168.1.100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Port</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="4840"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Test Connection</Button>
        </div>
      </div>
    </Modal>
  );
};

// Deployment Confirmation Modal
export const DeploymentConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deployment" size="lg">
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Safety Checks</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✓ Agent signature verified</li>
            <li>✓ Safety invariants validated</li>
            <li>✓ Device compatibility confirmed</li>
            <li>✓ Resource requirements met</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Deployment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Devices:</span>
              <span>3 PLCs</span>
            </div>
            <div className="flex justify-between">
              <span>Agents:</span>
              <span>Voltage Event Detector</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <span>2-3 minutes</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Deploy Now</Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// 7. MAIN WIREFRAME ROUTER
// ============================================================================

interface WireframeRouterProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const WireframeRouter: React.FC<WireframeRouterProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  switch (currentScreen) {
    case 'canvas':
      return <CanvasWireframe isActive={true} onNavigate={onNavigate} />;
    case 'marketplace':
      return <MarketplaceWireframe isActive={true} onNavigate={onNavigate} />;
    case 'fleet':
      return <FleetWireframe isActive={true} onNavigate={onNavigate} />;
    case 'alerts':
      return <AlertsWireframe isActive={true} onNavigate={onNavigate} />;
    case 'docs':
      return <DocumentationWireframe isActive={true} onNavigate={onNavigate} />;
    default:
      return <CanvasWireframe isActive={true} onNavigate={onNavigate} />;
  }
};

// ============================================================================
// 8. INTERACTION MAP COMPONENT
// ============================================================================

export const InteractionMap: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-4">User Flow Map</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm">Canvas → Marketplace → Install Agent</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Canvas → Configure → Deploy</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm">Fleet → Device → Monitor</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Alerts → Investigate → Resolve</span>
        </div>
      </div>
    </div>
  );
};

export default WireframeRouter; 