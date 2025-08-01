import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A badge component for displaying status, counts, and labels in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "success", "warning", "error", "neutral"],
      description: "The visual style variant of the badge",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "The size of the badge",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning",
    variant: "warning",
  },
};

export const Error: Story = {
  args: {
    children: "Error",
    variant: "error",
  },
};

export const Neutral: Story = {
  args: {
    children: "Neutral",
    variant: "neutral",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const WithCount: Story = {
  args: {
    children: "Notifications",
    variant: "primary",
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Badge {...args} />
      <Badge variant="error" size="sm">3</Badge>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success">Online</Badge>
      <Badge variant="warning">Maintenance</Badge>
      <Badge variant="error">Offline</Badge>
      <Badge variant="neutral">Unknown</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common status indicators using badges.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All badge variants in a single view for comparison.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All badge sizes in a single view for comparison.",
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success" className="flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        Active
      </Badge>
      <Badge variant="warning" className="flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        Warning
      </Badge>
      <Badge variant="error" className="flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        Error
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges with icons for enhanced visual communication.",
      },
    },
  },
}; 