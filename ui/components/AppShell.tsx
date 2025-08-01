import React, { useState } from 'react';
import { cn } from '../utils/cn';

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  leftRailWidth?: number; // Default 40px
  inspectorWidth?: string; // Default 30%
  showLeftRail?: boolean;
  showTopBar?: boolean;
  showInspector?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  className,
  leftRailWidth = 40,
  inspectorWidth = '30%',
  showLeftRail = true,
  showTopBar = true,
  showInspector = true,
}) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  return (
    <div className={cn("h-screen flex flex-col bg-gray-50", className)}>
      {/* Top Bar */}
      {showTopBar && (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">EP</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">EdgePlug</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Rail */}
        {showLeftRail && (
          <div 
            className="bg-white border-r border-gray-200 flex flex-col items-center py-4"
            style={{ width: `${leftRailWidth}px` }}
          >
            <button className="w-8 h-8 mb-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </button>
            <button className="w-8 h-8 mb-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            <button className="w-8 h-8 mb-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </button>
            <button className="w-8 h-8 mb-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Pane */}
        <div className="flex-1 flex">
          <div className="flex-1 bg-gray-50">
            {children}
          </div>

          {/* Inspector Panel */}
          {showInspector && isInspectorOpen && (
            <div 
              className="bg-white border-l border-gray-200 flex flex-col"
              style={{ width: inspectorWidth }}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Inspector</h3>
                <button 
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                      <option>PLC</option>
                      <option>Transformer</option>
                      <option>Breaker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inspector Toggle Button */}
          {showInspector && !isInspectorOpen && (
            <button 
              onClick={() => setIsInspectorOpen(true)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 