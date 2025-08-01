import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppShell } from './AppShell';
import { SkeletonText } from './Skeleton';

// Placeholder components for different routes
const Dashboard = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { title: "Total Agents", value: "24", change: "+12%", color: "blue" },
        { title: "Active Devices", value: "18", change: "+5%", color: "green" },
        { title: "Alerts", value: "3", change: "-2", color: "yellow" },
        { title: "Uptime", value: "99.8%", change: "+0.1%", color: "purple" },
      ].map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
              <div className={`w-6 h-6 bg-${stat.color}-500 rounded`}></div>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">{stat.change}</p>
        </div>
      ))}
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Agent {index + 1} deployed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Success
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Agents = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Agents</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Agent
      </button>
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Agent Library</h3>
      </div>
      <div className="p-6">
        <SkeletonText lines={8} />
      </div>
    </div>
  </div>
);

const Fleet = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Fleet Management</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Device
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Device {index + 1}</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            PLC-{String(index + 1).padStart(3, '0')} • Online
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uptime</span>
              <span className="font-medium">99.8%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Update</span>
              <span className="font-medium">2 min ago</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Alerts = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Alerts</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        View All
      </button>
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[
            { type: "warning", title: "High CPU Usage", device: "PLC-001", time: "5 min ago" },
            { type: "error", title: "Connection Lost", device: "PLC-003", time: "12 min ago" },
            { type: "info", title: "Update Available", device: "PLC-002", time: "1 hour ago" },
          ].map((alert, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded">
              <div className={`w-3 h-3 rounded-full bg-${alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}-500`}></div>
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-gray-500">{alert.device} • {alert.time}</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Settings</h2>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Application Settings</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Enable notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/agents', label: 'Agents', icon: '🤖' },
    { path: '/fleet', label: 'Fleet', icon: '🚀' },
    { path: '/alerts', label: 'Alerts', icon: '⚠️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <div className="flex flex-col items-center py-4">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`w-8 h-8 mb-4 rounded flex items-center justify-center text-lg ${
            location.pathname === item.path
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};

// Main App component with routing
export const AppRouter: React.FC = () => {
  return (
    <Router>
      <AppShell
        leftRailWidth={40}
        inspectorWidth="30%"
        showLeftRail={true}
        showTopBar={true}
        showInspector={true}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </Router>
  );
};

// Custom hook for navigation
export const useNavigation = () => {
  const location = useLocation();
  
  const navigate = (path: string) => {
    window.location.href = path;
  };
  
  return {
    currentPath: location.pathname,
    navigate,
  };
}; 