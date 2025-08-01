import React, { useState, useCallback } from 'react';
import { Button, Badge, Modal, Drawer, Tooltip } from './index';

// High-Fidelity Canvas Workspace
interface CanvasHifiProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const CanvasHifi: React.FC<CanvasHifiProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showSignalMap, setShowSignalMap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    setShowSignalMap(true);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isActive) return null;

  return (
    <div className="h-screen bg-ep-gray-50 flex">
      {/* Left Rail - Toolbox */}
      <div className="w-40 bg-white border-r border-ep-gray-200 p-4">
        <div className="mb-6">
          <h3 className="text-ep-gray-900 font-semibold text-sm mb-3">Toolbox</h3>
          <div className="space-y-2">
            <div 
              className="p-3 border border-ep-gray-200 rounded-lg cursor-pointer hover:border-ep-primary-500 hover:bg-ep-primary-50 transition-colors duration-75"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-ep-primary-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z"/>
                    <path fillRule="evenodd" d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM5 5a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-ep-gray-700">PLC</span>
              </div>
            </div>
            
            <div 
              className="p-3 border border-ep-gray-200 rounded-lg cursor-pointer hover:border-ep-primary-500 hover:bg-ep-primary-50 transition-colors duration-75"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-ep-secondary-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-ep-gray-700">Transformer</span>
              </div>
            </div>
            
            <div 
              className="p-3 border border-ep-gray-200 rounded-lg cursor-pointer hover:border-ep-primary-500 hover:bg-ep-primary-50 transition-colors duration-75"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-ep-warning-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-ep-gray-700">Breaker</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-ep-gray-900 font-semibold text-sm mb-3">Agents</h3>
          <div className="space-y-2">
            <div className="p-3 border border-ep-gray-200 rounded-lg bg-ep-success-50 border-ep-success-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-ep-success-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-ep-success-700">Voltage Monitor</span>
              </div>
            </div>
            
            <div className="p-3 border border-ep-gray-200 rounded-lg bg-ep-warning-50 border-ep-warning-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-ep-warning-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-ep-warning-700">Current Monitor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-ep-gray-50">
        {/* Canvas Header */}
        <div className="h-16 bg-white border-b border-ep-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-ep-gray-900">Digital Twin Canvas</h1>
            <Badge variant="success" size="sm">Connected</Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            
            <Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Deploy
            </Button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="absolute inset-0 top-16 p-6">
          <div className="w-full h-full bg-white rounded-lg border-2 border-dashed border-ep-gray-300 relative">
            {/* Sample Nodes */}
            <div 
              className="absolute top-20 left-20 w-32 h-24 bg-ep-primary-50 border-2 border-ep-primary-200 rounded-lg cursor-pointer hover:border-ep-primary-400 transition-colors duration-75"
              onClick={() => handleNodeClick('plc-1')}
            >
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-ep-primary-600 rounded"></div>
                  <span className="text-sm font-medium text-ep-gray-700">PLC-001</span>
                </div>
                <div className="text-xs text-ep-gray-500">192.168.1.100</div>
              </div>
            </div>
            
            <div 
              className="absolute top-20 left-80 w-32 h-24 bg-ep-secondary-50 border-2 border-ep-secondary-200 rounded-lg cursor-pointer hover:border-ep-secondary-400 transition-colors duration-75"
              onClick={() => handleNodeClick('transformer-1')}
            >
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-ep-secondary-500 rounded"></div>
                  <span className="text-sm font-medium text-ep-gray-700">T-001</span>
                </div>
                <div className="text-xs text-ep-gray-500">480V → 120V</div>
              </div>
            </div>
            
            <div 
              className="absolute top-60 left-20 w-32 h-24 bg-ep-warning-50 border-2 border-ep-warning-200 rounded-lg cursor-pointer hover:border-ep-warning-400 transition-colors duration-75"
              onClick={() => handleNodeClick('breaker-1')}
            >
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-ep-warning-500 rounded"></div>
                  <span className="text-sm font-medium text-ep-gray-700">CB-001</span>
                </div>
                <div className="text-xs text-ep-gray-500">Status: Open</div>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none">
              <line 
                x1="152" y1="68" x2="328" y2="68" 
                stroke="#6b7280" 
                strokeWidth="2" 
                strokeDasharray="5,5"
              />
              <line 
                x1="152" y1="108" x2="152" y2="248" 
                stroke="#6b7280" 
                strokeWidth="2" 
                strokeDasharray="5,5"
              />
            </svg>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Inspector Panel */}
      <div className="w-80 bg-white border-l border-ep-gray-200 p-4">
        <div className="mb-6">
          <h3 className="text-ep-gray-900 font-semibold text-sm mb-3">Inspector</h3>
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ep-gray-700 mb-1">Node ID</label>
                <input 
                  type="text" 
                  value={selectedNode}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-ep-gray-300 rounded-md bg-ep-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-ep-gray-700 mb-1">Status</label>
                <Badge variant="success" size="sm">Online</Badge>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-ep-gray-700 mb-1">Last Update</label>
                <div className="text-sm text-ep-gray-600">2 minutes ago</div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-ep-gray-700 mb-1">Connected Agents</label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-ep-success-500 rounded-full"></div>
                    <span className="text-sm text-ep-gray-600">Voltage Monitor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-ep-warning-500 rounded-full"></div>
                    <span className="text-sm text-ep-gray-600">Current Monitor</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ep-gray-500">Select a node to view details</div>
          )}
        </div>
      </div>

      {/* Signal Map Drawer */}
      <Drawer
        isOpen={showSignalMap}
        onClose={() => setShowSignalMap(false)}
        title="Signal Map"
        position="right"
        size="lg"
      >
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-ep-gray-900 mb-4">Signal Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ep-gray-700 mb-2">Input Signals</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-ep-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-ep-gray-900">Voltage_Phase_A</div>
                      <div className="text-xs text-ep-gray-500">Analog Input 1</div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-ep-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-ep-gray-900">Current_Phase_A</div>
                      <div className="text-xs text-ep-gray-500">Analog Input 2</div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ep-gray-700 mb-2">Output Signals</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-ep-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-ep-gray-900">Alarm_Output</div>
                      <div className="text-xs text-ep-gray-500">Digital Output 1</div>
                    </div>
                    <Badge variant="warning" size="sm">Inactive</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="primary" size="sm">
              Save Configuration
            </Button>
            <Button variant="secondary" size="sm">
              Test Signals
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

// High-Fidelity Marketplace
interface MarketplaceHifiProps {
  isActive?: boolean;
  onNavigate?: (screen: string) => void;
}

export const MarketplaceHifi: React.FC<MarketplaceHifiProps> = ({ 
  isActive = false, 
  onNavigate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAgentDetails, setShowAgentDetails] = useState(false);

  if (!isActive) return null;

  return (
    <div className="h-screen bg-ep-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-ep-gray-200 flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-ep-gray-900">Agent Marketplace</h1>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </Button>
          <Button variant="primary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload Agent
          </Button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-ep-gray-200 p-4">
          <div className="mb-6">
            <h3 className="text-ep-gray-900 font-semibold text-sm mb-3">Categories</h3>
            <div className="space-y-1">
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-ep-primary-50 text-ep-primary-700 border border-ep-primary-200' 
                    : 'text-ep-gray-600 hover:bg-ep-gray-50'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All Agents
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === 'monitoring' 
                    ? 'bg-ep-primary-50 text-ep-primary-700 border border-ep-primary-200' 
                    : 'text-ep-gray-600 hover:bg-ep-gray-50'
                }`}
                onClick={() => setSelectedCategory('monitoring')}
              >
                Monitoring
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === 'control' 
                    ? 'bg-ep-primary-50 text-ep-primary-700 border border-ep-primary-200' 
                    : 'text-ep-gray-600 hover:bg-ep-gray-50'
                }`}
                onClick={() => setSelectedCategory('control')}
              >
                Control
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === 'safety' 
                    ? 'bg-ep-primary-50 text-ep-primary-700 border border-ep-primary-200' 
                    : 'text-ep-gray-600 hover:bg-ep-gray-50'
                }`}
                onClick={() => setSelectedCategory('safety')}
              >
                Safety
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-ep-gray-900 font-semibold text-sm mb-3">Certification</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-ep-gray-300 text-ep-primary-600 focus:ring-ep-primary-500" />
                <span className="text-sm text-ep-gray-700">Certified Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-ep-gray-300 text-ep-primary-600 focus:ring-ep-primary-500" />
                <span className="text-sm text-ep-gray-700">Safety Certified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-ep-gray-300 rounded-lg focus:ring-2 focus:ring-ep-primary-500 focus:border-ep-primary-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Agent Card 1 */}
            <div className="bg-white border border-ep-gray-200 rounded-lg p-4 hover:border-ep-primary-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-ep-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ep-gray-900">Voltage Monitor</h3>
                    <p className="text-xs text-ep-gray-500">by EdgePlug</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">Certified</Badge>
              </div>
              
              <p className="text-sm text-ep-gray-600 mb-4">
                Monitors voltage levels and detects anomalies in electrical systems.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-ep-gray-500">
                  <span>⭐ 4.8</span>
                  <span>📥 1.2k</span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAgentDetails(true)}
                >
                  Install
                </Button>
              </div>
            </div>

            {/* Agent Card 2 */}
            <div className="bg-white border border-ep-gray-200 rounded-lg p-4 hover:border-ep-primary-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-ep-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ep-gray-900">Current Monitor</h3>
                    <p className="text-xs text-ep-gray-500">by EdgePlug</p>
                  </div>
                </div>
                <Badge variant="warning" size="sm">Beta</Badge>
              </div>
              
              <p className="text-sm text-ep-gray-600 mb-4">
                Tracks current consumption and identifies overload conditions.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-ep-gray-500">
                  <span>⭐ 4.5</span>
                  <span>📥 856</span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAgentDetails(true)}
                >
                  Install
                </Button>
              </div>
            </div>

            {/* Agent Card 3 */}
            <div className="bg-white border border-ep-gray-200 rounded-lg p-4 hover:border-ep-primary-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-ep-warning-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ep-gray-900">Safety Monitor</h3>
                    <p className="text-xs text-ep-gray-500">by SafetyCorp</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">Safety</Badge>
              </div>
              
              <p className="text-sm text-ep-gray-600 mb-4">
                Ensures safety compliance and emergency shutdown procedures.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-ep-gray-500">
                  <span>⭐ 4.9</span>
                  <span>📥 2.1k</span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowAgentDetails(true)}
                >
                  Install
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      <Modal
        isOpen={showAgentDetails}
        onClose={() => setShowAgentDetails(false)}
        title="Agent Details"
        size="lg"
      >
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-ep-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ep-gray-900">Voltage Monitor</h3>
                <p className="text-sm text-ep-gray-500">by EdgePlug • v2.1.0</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="success" size="sm">Certified</Badge>
                  <Badge variant="primary" size="sm">Monitoring</Badge>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-ep-gray-600 mb-4">
              Advanced voltage monitoring agent that detects anomalies, predicts failures, and provides real-time alerts for electrical systems.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-ep-gray-900 mb-2">Requirements</h4>
                <ul className="text-xs text-ep-gray-600 space-y-1">
                  <li>• Cortex-M4F or higher</li>
                  <li>• 32KB Flash, 4KB SRAM</li>
                  <li>• Voltage sensor input</li>
                  <li>• OPC-UA or Modbus support</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-ep-gray-900 mb-2">Performance</h4>
                <ul className="text-xs text-ep-gray-600 space-y-1">
                  <li>• ≤500µs inference time</li>
                  <li>• 99.9% uptime</li>
                  <li>• <1ms actuation delay</li>
                  <li>• Real-time alerts</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="primary" size="md">
              Install Agent
            </Button>
            <Button variant="secondary" size="md">
              View Documentation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Export all high-fidelity components
export {
  CanvasHifi,
  MarketplaceHifi
}; 