import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A modal component for displaying overlays, dialogs, and forms in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "The size of the modal",
    },
    showCloseButton: {
      control: { type: "boolean" },
      description: "Whether to show the close button",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWrapper = ({ children, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Modal
      </button>
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        {...props}
      >
        {children}
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <ModalWrapper {...args}>
      <p>This is the default modal content. It can contain any React components.</p>
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Confirm
        </button>
        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </ModalWrapper>
  ),
};

export const Small: Story = {
  render: (args) => (
    <ModalWrapper {...args} size="sm">
      <p>This is a small modal with limited content.</p>
    </ModalWrapper>
  ),
};

export const Large: Story = {
  render: (args) => (
    <ModalWrapper {...args} size="lg">
      <div className="space-y-4">
        <p>This is a large modal with more content space.</p>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Additional Information</h3>
          <p>This modal can accommodate more complex content layouts.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium">Section 1</h4>
            <p className="text-sm text-gray-600">Content for section 1</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <h4 className="font-medium">Section 2</h4>
            <p className="text-sm text-gray-600">Content for section 2</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const ExtraLarge: Story = {
  render: (args) => (
    <ModalWrapper {...args} size="xl">
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Complex Form</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter your message"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit
          </button>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const WithoutCloseButton: Story = {
  render: (args) => (
    <ModalWrapper {...args} showCloseButton={false}>
      <p>This modal doesn't have a close button. Users must use the ESC key or click outside to close.</p>
      <div className="mt-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Close
        </button>
      </div>
    </ModalWrapper>
  ),
};

export const WithForm: Story = {
  render: (args) => (
    <ModalWrapper {...args} title="Create New Agent">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter agent name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
            <option>Select type</option>
            <option>Voltage Monitor</option>
            <option>Current Monitor</option>
            <option>Temperature Sensor</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create Agent
          </button>
        </div>
      </form>
    </ModalWrapper>
  ),
};

export const ConfirmationDialog: Story = {
  render: (args) => (
    <ModalWrapper {...args} title="Confirm Action" size="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Agent</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete this agent? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const AllSizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<string | null>(null);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setOpenSize("sm")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Small Modal
          </button>
          <button 
            onClick={() => setOpenSize("md")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Medium Modal
          </button>
          <button 
            onClick={() => setOpenSize("lg")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Large Modal
          </button>
          <button 
            onClick={() => setOpenSize("xl")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Extra Large Modal
          </button>
        </div>
        
        {openSize && (
          <Modal 
            isOpen={true} 
            onClose={() => setOpenSize(null)}
            title={`${openSize.toUpperCase()} Modal`}
            size={openSize as any}
          >
            <p>This is a {openSize} modal. The content area adjusts based on the size prop.</p>
            <div className="mt-4">
              <button 
                onClick={() => setOpenSize(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing all modal sizes.",
      },
    },
  },
}; 