import type { Meta, StoryObj } from "@storybook/react";
import { AppRouter } from "./Router";

const meta: Meta<typeof AppRouter> = {
  title: "Layout/Router",
  component: AppRouter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "React Router v6 setup with AppShell layout and placeholder content for different routes.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AppRouter />,
  parameters: {
    docs: {
      description: {
        story: "Complete application with routing, AppShell layout, and placeholder content for all routes.",
      },
    },
  },
}; 