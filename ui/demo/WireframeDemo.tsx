import React, { useState } from 'react';
import { WireframeRouter, InteractionMap } from '../components';

const WireframeDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('canvas');
  const [showInteractionMap, setShowInteractionMap] = useState(false);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Demo Header */}
      <div className="h-12 bg-gray-800 text-white flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">EdgePlug UI Wireframes - D02 Demo</span>
          <span className="text-sm text-gray-300">Current: {currentScreen}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInteractionMap(!showInteractionMap)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            {showInteractionMap ? 'Hide' : 'Show'} Flow Map
          </button>
          
          <div className="flex space-x-1">
            {['canvas', 'marketplace', 'fleet', 'alerts', 'docs'].map((screen) => (
              <button
                key={screen}
                onClick={() => handleNavigate(screen)}
                className={`px-2 py-1 text-xs rounded ${
                  currentScreen === screen 
                    ? 'bg-white text-gray-800' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                {screen.charAt(0).toUpperCase() + screen.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Wireframe Content */}
        <div className="h-full">
          <WireframeRouter 
            currentScreen={currentScreen} 
            onNavigate={handleNavigate} 
          />
        </div>

        {/* Interaction Map Overlay */}
        {showInteractionMap && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
            <InteractionMap />
          </div>
        )}
      </div>

      {/* Demo Instructions */}
      <div className="h-32 bg-gray-50 border-t border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-2">Demo Instructions</h3>
        <div className="text-sm space-y-1">
          <p><strong>Canvas:</strong> Main workspace for configuring deployments. Try clicking "Assets" and "Agents" buttons.</p>
          <p><strong>Marketplace:</strong> Browse and install ML agents. Try the search and filter functionality.</p>
          <p><strong>Fleet:</strong> Monitor deployed devices. Click on different devices to see details.</p>
          <p><strong>Alerts:</strong> View and manage system alerts. Click on alerts to see details.</p>
          <p><strong>Docs:</strong> Access documentation and help resources.</p>
          <p><strong>Flow Map:</strong> Click "Show Flow Map" to see user journey connections.</p>
        </div>
      </div>
    </div>
  );
};

export default WireframeDemo; 