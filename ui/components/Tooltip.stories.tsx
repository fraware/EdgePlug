import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A tooltip component for displaying helpful information on hover in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    position: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
      description: "The position of the tooltip relative to the trigger element",
    },
    delay: {
      control: { type: "number" },
      description: "Delay in milliseconds before showing the tooltip",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip appears on top" position="top">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (Top)
        </button>
      </Tooltip>
    </div>
  ),
};

export const Bottom: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip appears below" position="bottom">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (Bottom)
        </button>
      </Tooltip>
    </div>
  ),
};

export const Left: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip appears on the left" position="left">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (Left)
        </button>
      </Tooltip>
    </div>
  ),
};

export const Right: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip appears on the right" position="right">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (Right)
        </button>
      </Tooltip>
    </div>
  ),
};

export const LongDelay: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip has a long delay" delay={1000}>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (1s delay)
        </button>
      </Tooltip>
    </div>
  ),
};

export const ShortDelay: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip {...args} content="This tooltip has a short delay" delay={100}>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me (100ms delay)
        </button>
      </Tooltip>
    </div>
  ),
};

export const ComplexContent: Story = {
  render: (args) => (
    <div className="flex items-center justify-center h-32">
      <Tooltip 
        {...args} 
        content={
          <div className="space-y-2">
            <h4 className="font-semibold">Agent Status</h4>
            <div className="text-sm space-y-1">
              <p>• CPU: 45%</p>
              <p>• Memory: 2.1GB</p>
              <p>• Uptime: 7 days</p>
              <p>• Last update: 2 min ago</p>
            </div>
          </div>
        }
      >
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Agent Details
        </button>
      </Tooltip>
    </div>
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="flex items-center justify-center h-32">
        <Tooltip content="Top tooltip" position="top">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Top
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-center h-32">
        <Tooltip content="Bottom tooltip" position="bottom">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Bottom
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-center h-32">
        <Tooltip content="Left tooltip" position="left">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Left
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-center h-32">
        <Tooltip content="Right tooltip" position="right">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Right
          </button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All tooltip positions in a grid layout for comparison.",
      },
    },
  },
};

export const DifferentTriggers: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Tooltip content="Button tooltip">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Button
          </button>
        </Tooltip>
        
        <Tooltip content="Link tooltip">
          <a href="#" className="text-blue-600 hover:text-blue-800 underline">
            Link
          </a>
        </Tooltip>
        
        <Tooltip content="Icon tooltip">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-help">
            <span className="text-sm">?</span>
          </div>
        </Tooltip>
        
        <Tooltip content="Input tooltip">
          <input 
            type="text" 
            placeholder="Hover me"
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips on different types of trigger elements.",
      },
    },
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Tooltip content="Very long tooltip text that might wrap to multiple lines and test the tooltip's ability to handle long content gracefully">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Long Text
          </button>
        </Tooltip>
        
        <Tooltip content="Short">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Short Text
          </button>
        </Tooltip>
        
        <Tooltip content="HTML content with <strong>bold</strong> and <em>italic</em> text">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            HTML Content
          </button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips with edge cases like long text, short text, and HTML content.",
      },
    },
  },
};

export const InteractiveContent: Story = {
  render: () => (
    <div className="flex items-center justify-center h-32">
      <Tooltip 
        content={
          <div className="space-y-2">
            <p>Click the button below to copy the agent ID</p>
            <button 
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText("AGENT-001");
              }}
            >
              Copy ID
            </button>
          </div>
        }
      >
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Interactive Tooltip
        </button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltip with interactive content that includes buttons and click handlers.",
      },
    },
  },
}; 