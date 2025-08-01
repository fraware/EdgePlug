import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./AppShell";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "The main application shell with 40px rail and 30% inspector layout for the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    leftRailWidth: {
      control: { type: "number" },
      description: "Width of the left rail in pixels",
    },
    inspectorWidth: {
      control: { type: "text" },
      description: "Width of the inspector panel",
    },
    showLeftRail: {
      control: { type: "boolean" },
      description: "Whether to show the left rail",
    },
    showTopBar: {
      control: { type: "boolean" },
      description: "Whether to show the top bar",
    },
    showInspector: {
      control: { type: "boolean" },
      description: "Whether to show the inspector panel",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
        <p className="text-gray-600 mb-4">
          This is the main content area of the application. The layout includes:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>40px left rail with navigation icons</li>
          <li>30% inspector panel on the right</li>
          <li>Flexible main content area</li>
          <li>Top bar with branding and actions</li>
        </ul>
      </div>
    ),
  },
};

export const WithoutInspector: Story = {
  args: {
    showInspector: false,
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Full Width Content</h2>
        <p className="text-gray-600 mb-4">
          When the inspector is hidden, the main content area takes up the full width.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Card {index + 1}</h3>
              <p className="text-gray-600 text-sm">
                This is a sample card to demonstrate the full-width layout.
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const WithoutLeftRail: Story = {
  args: {
    showLeftRail: false,
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">No Left Rail</h2>
        <p className="text-gray-600 mb-4">
          This layout hides the left rail for a cleaner, more spacious design.
        </p>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Content Area</h3>
          <p className="text-gray-600">
            The main content area now has more horizontal space without the left rail.
          </p>
        </div>
      </div>
    ),
  },
};

export const WithoutTopBar: Story = {
  args: {
    showTopBar: false,
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">No Top Bar</h2>
        <p className="text-gray-600 mb-4">
          This layout removes the top bar for a more immersive experience.
        </p>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Full Height Content</h3>
          <p className="text-gray-600">
            The content area now extends to the full height of the viewport.
          </p>
        </div>
      </div>
    ),
  },
};

export const CustomSizes: Story = {
  args: {
    leftRailWidth: 60,
    inspectorWidth: "25%",
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Custom Layout</h2>
        <p className="text-gray-600 mb-4">
          This layout uses custom sizes: 60px left rail and 25% inspector width.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Left Column</h3>
            <p className="text-gray-600 text-sm">
              Content in the left column of the main area.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Right Column</h3>
            <p className="text-gray-600 text-sm">
              Content in the right column of the main area.
            </p>
          </div>
        </div>
      </div>
    ),
  },
};

export const MinimalLayout: Story = {
  args: {
    showLeftRail: false,
    showTopBar: false,
    showInspector: false,
    children: (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Minimal Layout</h2>
        <p className="text-gray-600 mb-4">
          This is the most minimal layout with no rails, top bar, or inspector.
        </p>
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Full Screen Content</h3>
          <p className="text-gray-600 mb-4">
            The content area now uses the entire viewport for maximum space utilization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Section {index + 1}</h4>
                <p className="text-gray-600 text-sm">
                  This is a sample section in the minimal layout.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
};

export const WithComplexContent: Story = {
  args: {
    children: (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add New
          </button>
        </div>
        
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
    ),
  },
}; 