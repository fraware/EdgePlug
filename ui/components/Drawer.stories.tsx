import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A drawer component for side panels, navigation, and detailed views in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    position: {
      control: { type: "select" },
      options: ["left", "right", "top", "bottom"],
      description: "The position of the drawer",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "The size of the drawer",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const DrawerWrapper = ({ children, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Drawer
      </button>
      <Drawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Example Drawer"
        {...props}
      >
        {children}
      </Drawer>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <DrawerWrapper {...args}>
      <div className="space-y-4">
        <p>This is the default drawer content. It can contain any React components.</p>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Additional Information</h3>
          <p className="text-sm text-gray-600">This drawer can accommodate various content types.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </DrawerWrapper>
  ),
};

export const RightPosition: Story = {
  render: (args) => (
    <DrawerWrapper {...args} position="right">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Settings Panel</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
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
    </DrawerWrapper>
  ),
};

export const LeftPosition: Story = {
  render: (args) => (
    <DrawerWrapper {...args} position="left">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Navigation</h3>
        <nav className="space-y-2">
          <a href="#" className="block px-3 py-2 text-blue-600 bg-blue-50 rounded">Dashboard</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Agents</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Fleet</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Alerts</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Settings</a>
        </nav>
      </div>
    </DrawerWrapper>
  ),
};

export const TopPosition: Story = {
  render: (args) => (
    <DrawerWrapper {...args} position="top">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
              <span className="text-sm">New Agent</span>
            </div>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded mx-auto mb-2"></div>
              <span className="text-sm">Deploy</span>
            </div>
          </button>
          <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-yellow-500 rounded mx-auto mb-2"></div>
              <span className="text-sm">Monitor</span>
            </div>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500 rounded mx-auto mb-2"></div>
              <span className="text-sm">Reports</span>
            </div>
          </button>
        </div>
      </div>
    </DrawerWrapper>
  ),
};

export const BottomPosition: Story = {
  render: (args) => (
    <DrawerWrapper {...args} position="bottom">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Device Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm text-gray-600">Device ID</span>
            <p className="font-medium">PLC-001</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm text-gray-600">Status</span>
            <p className="font-medium text-green-600">Online</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm text-gray-600">Last Update</span>
            <p className="font-medium">2 minutes ago</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm text-gray-600">Uptime</span>
            <p className="font-medium">99.8%</p>
          </div>
        </div>
      </div>
    </DrawerWrapper>
  ),
};

export const LargeSize: Story = {
  render: (args) => (
    <DrawerWrapper {...args} size="lg">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Agent Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Agent Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter agent name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={4}
              placeholder="Enter description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded">
                <option>Voltage Monitor</option>
                <option>Current Monitor</option>
                <option>Temperature Sensor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium mb-2">Configuration Options</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Enable real-time monitoring</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Send alerts on threshold breach</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Log all events</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Configuration
          </button>
        </div>
      </div>
    </DrawerWrapper>
  ),
};

export const AllPositions: Story = {
  render: () => {
    const [openPosition, setOpenPosition] = useState<string | null>(null);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setOpenPosition("left")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Left Drawer
          </button>
          <button 
            onClick={() => setOpenPosition("right")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Right Drawer
          </button>
          <button 
            onClick={() => setOpenPosition("top")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Top Drawer
          </button>
          <button 
            onClick={() => setOpenPosition("bottom")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Bottom Drawer
          </button>
        </div>
        
        {openPosition && (
          <Drawer 
            isOpen={true} 
            onClose={() => setOpenPosition(null)}
            title={`${openPosition.charAt(0).toUpperCase() + openPosition.slice(1)} Drawer`}
            position={openPosition as any}
          >
            <p>This is a {openPosition} drawer. The content slides in from the {openPosition} side.</p>
            <div className="mt-4">
              <button 
                onClick={() => setOpenPosition(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </Drawer>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing all drawer positions.",
      },
    },
  },
}; 