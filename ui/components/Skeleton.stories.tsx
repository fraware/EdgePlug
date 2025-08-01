import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonList } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Skeleton components for loading states in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "circular", "rectangular"],
      description: "The visual variant of the skeleton",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "The size of the skeleton",
    },
    width: {
      control: { type: "text" },
      description: "Width of the skeleton",
    },
    height: {
      control: { type: "text" },
      description: "Height of the skeleton",
    },
    lines: {
      control: { type: "number" },
      description: "Number of lines for text skeleton",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "text",
    size: "md",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    size: "md",
  },
};

export const Circular: Story = {
  args: {
    variant: "circular",
    size: "md",
    width: "48px",
    height: "48px",
  },
};

export const Rectangular: Story = {
  args: {
    variant: "rectangular",
    size: "md",
    width: "200px",
    height: "100px",
  },
};

export const Small: Story = {
  args: {
    variant: "text",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    variant: "text",
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    variant: "text",
    size: "xl",
  },
};

export const MultipleLines: Story = {
  args: {
    variant: "text",
    size: "md",
    lines: 3,
  },
};

export const CustomWidth: Story = {
  args: {
    variant: "text",
    size: "md",
    width: "150px",
  },
};

export const CustomHeight: Story = {
  args: {
    variant: "text",
    size: "md",
    height: "20px",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="w-16 text-sm text-gray-500">Small:</span>
        <Skeleton size="sm" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="w-16 text-sm text-gray-500">Medium:</span>
        <Skeleton size="md" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="w-16 text-sm text-gray-500">Large:</span>
        <Skeleton size="lg" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="w-16 text-sm text-gray-500">Extra Large:</span>
        <Skeleton size="xl" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All skeleton sizes for comparison.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="w-20 text-sm text-gray-500">Text:</span>
        <Skeleton variant="text" size="md" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="w-20 text-sm text-gray-500">Circular:</span>
        <Skeleton variant="circular" size="md" width="48px" height="48px" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="w-20 text-sm text-gray-500">Rectangular:</span>
        <Skeleton variant="rectangular" size="md" width="200px" height="100px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All skeleton variants for comparison.",
      },
    },
  },
};

// SkeletonText stories
export const TextComponent: Story = {
  render: () => <SkeletonText lines={3} />,
  parameters: {
    docs: {
      description: {
        story: "Predefined skeleton for text content with multiple lines.",
      },
    },
  },
};

export const TextWithCustomLines: Story = {
  render: () => <SkeletonText lines={5} />,
  parameters: {
    docs: {
      description: {
        story: "Skeleton text with custom number of lines.",
      },
    },
  },
};

// SkeletonAvatar stories
export const AvatarSmall: Story = {
  render: () => <SkeletonAvatar size="sm" />,
  parameters: {
    docs: {
      description: {
        story: "Small avatar skeleton.",
      },
    },
  },
};

export const AvatarMedium: Story = {
  render: () => <SkeletonAvatar size="md" />,
  parameters: {
    docs: {
      description: {
        story: "Medium avatar skeleton.",
      },
    },
  },
};

export const AvatarLarge: Story = {
  render: () => <SkeletonAvatar size="lg" />,
  parameters: {
    docs: {
      description: {
        story: "Large avatar skeleton.",
      },
    },
  },
};

export const AllAvatarSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All avatar skeleton sizes for comparison.",
      },
    },
  },
};

// SkeletonCard stories
export const Card: Story = {
  render: () => <SkeletonCard />,
  parameters: {
    docs: {
      description: {
        story: "Predefined skeleton for card components.",
      },
    },
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multiple skeleton cards in a grid layout.",
      },
    },
  },
};

// SkeletonTable stories
export const Table: Story = {
  render: () => <SkeletonTable rows={5} columns={4} />,
  parameters: {
    docs: {
      description: {
        story: "Predefined skeleton for table components.",
      },
    },
  },
};

export const TableWithCustomDimensions: Story = {
  render: () => <SkeletonTable rows={3} columns={6} />,
  parameters: {
    docs: {
      description: {
        story: "Skeleton table with custom rows and columns.",
      },
    },
  },
};

// SkeletonList stories
export const List: Story = {
  render: () => <SkeletonList items={5} />,
  parameters: {
    docs: {
      description: {
        story: "Predefined skeleton for list components.",
      },
    },
  },
};

export const ListWithCustomItems: Story = {
  render: () => <SkeletonList items={3} />,
  parameters: {
    docs: {
      description: {
        story: "Skeleton list with custom number of items.",
      },
    },
  },
};

export const ComplexLoadingState: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton size="lg" width="200px" />
        <Skeleton size="md" width="100px" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Skeleton size="lg" width="150px" />
        </div>
        <div className="p-6">
          <SkeletonList items={4} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complex loading state combining multiple skeleton components.",
      },
    },
  },
};

export const DashboardLoading: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton size="xl" width="300px" />
        <Skeleton size="md" width="120px" height="40px" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Skeleton size="md" width="60%" />
              <SkeletonAvatar size="md" />
            </div>
            <Skeleton size="lg" className="mb-2" />
            <Skeleton size="sm" width="40%" />
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Skeleton size="lg" width="200px" />
        </div>
        <div className="p-6">
          <SkeletonTable rows={6} columns={3} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete dashboard loading state with various skeleton components.",
      },
    },
  },
}; 