import React, { useState } from 'react';
import { CanvasHifi, MarketplaceHifi } from '../components/HighFidelityPrototype';
import { Button, Badge } from '../components/index';

const HighFidelityDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'canvas' | 'marketplace'>('canvas');
  const [showFlowMap, setShowFlowMap] = useState(false);

  const handleNavigate = (screen: string) => {
    if (screen === 'canvas') setCurrentScreen('canvas');
    if (screen === 'marketplace') setCurrentScreen('marketplace');
  };

  return (
    <div className="min-h-screen bg-ep-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b border-ep-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-ep-gray-900">EdgePlug High-Fidelity Demo</h1>
            <Badge variant="primary" size="sm">D03 - Hi-Fi Prototype</Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowFlowMap(!showFlowMap)}
            >
              {showFlowMap ? 'Hide' : 'Show'} Flow Map
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-ep-gray-600">Screen:</span>
              <select 
                value={currentScreen}
                onChange={(e) => setCurrentScreen(e.target.value as 'canvas' | 'marketplace')}
                className="text-sm border border-ep-gray-300 rounded-md px-2 py-1"
              >
                <option value="canvas">Canvas Workspace</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Map Overlay */}
      {showFlowMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ep-gray-900">User Flow Map</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFlowMap(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-ep-gray-200 rounded-lg">
                  <h3 className="font-medium text-ep-gray-900 mb-2">Canvas Workspace</h3>
                  <ul className="text-sm text-ep-gray-600 space-y-1">
                    <li>• Drag & drop equipment from toolbox</li>
                    <li>• Connect devices with signal lines</li>
                    <li>• Configure agent deployments</li>
                    <li>• Real-time monitoring dashboard</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-ep-gray-200 rounded-lg">
                  <h3 className="font-medium text-ep-gray-900 mb-2">Marketplace</h3>
                  <ul className="text-sm text-ep-gray-600 space-y-1">
                    <li>• Browse certified ML agents</li>
                    <li>• Filter by category & certification</li>
                    <li>• View agent details & requirements</li>
                    <li>• Install agents to devices</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-ep-primary-50 border border-ep-primary-200 rounded-lg">
                <h3 className="font-medium text-ep-primary-900 mb-2">Key Interactions</h3>
                <div className="text-sm text-ep-primary-700 space-y-1">
                  <p>• <strong>Drag & Drop:</strong> Equipment from toolbox to canvas</p>
                  <p>• <strong>Double-click:</strong> Nodes to open signal configuration</p>
                  <p>• <strong>Search & Filter:</strong> Agents in marketplace</p>
                  <p>• <strong>Install & Deploy:</strong> Agents to target devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        <CanvasHifi 
          isActive={currentScreen === 'canvas'} 
          onNavigate={handleNavigate} 
        />
        <MarketplaceHifi 
          isActive={currentScreen === 'marketplace'} 
          onNavigate={handleNavigate} 
        />
      </div>

      {/* Demo Instructions */}
      <div className="fixed bottom-4 left-4 bg-white border border-ep-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-medium text-ep-gray-900 mb-2">Demo Instructions</h3>
        <div className="text-sm text-ep-gray-600 space-y-1">
          {currentScreen === 'canvas' ? (
            <>
              <p>• Click on nodes to view details</p>
              <p>• Drag equipment from toolbox</p>
              <p>• Use zoom controls</p>
              <p>• Configure signal mappings</p>
            </>
          ) : (
            <>
              <p>• Search for agents</p>
              <p>• Filter by category</p>
              <p>• Click "Install" to view details</p>
              <p>• Browse agent requirements</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighFidelityDemo; 