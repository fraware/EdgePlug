import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A toast notification component for displaying temporary messages and alerts in the EdgePlug design system.",
      },
    },
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["success", "warning", "error", "info"],
      description: "The type of toast notification",
    },
    duration: {
      control: { type: "number" },
      description: "Duration in milliseconds before auto-dismiss",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ToastWrapper = ({ children, ...props }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsVisible(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Show Toast
      </button>
      {isVisible && (
        <Toast 
          isVisible={isVisible} 
          onClose={() => setIsVisible(false)}
          {...props}
        >
          {children}
        </Toast>
      )}
    </>
  );
};

export const Success: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="success" title="Success">
      <p>Your action was completed successfully.</p>
    </ToastWrapper>
  ),
};

export const Warning: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="warning" title="Warning">
      <p>Please review your configuration before proceeding.</p>
    </ToastWrapper>
  ),
};

export const Error: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="error" title="Error">
      <p>An error occurred while processing your request.</p>
    </ToastWrapper>
  ),
};

export const Info: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="info" title="Information">
      <p>Here's some helpful information for you.</p>
    </ToastWrapper>
  ),
};

export const LongDuration: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="info" title="Long Duration" duration={10000}>
      <p>This toast will stay visible for 10 seconds.</p>
    </ToastWrapper>
  ),
};

export const ShortDuration: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="success" title="Quick Success" duration={2000}>
      <p>This toast will disappear quickly.</p>
    </ToastWrapper>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="warning" title="Action Required">
      <div className="space-y-2">
        <p>Your session is about to expire.</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Extend Session
          </button>
          <button className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Dismiss
          </button>
        </div>
      </div>
    </ToastWrapper>
  ),
};

export const ComplexContent: Story = {
  render: (args) => (
    <ToastWrapper {...args} type="info" title="System Update">
      <div className="space-y-2">
        <p>New agent version v2.1.0 is available.</p>
        <div className="text-sm text-gray-600">
          <p>• Improved performance by 15%</p>
          <p>• Fixed voltage monitoring bugs</p>
          <p>• Added new safety features</p>
        </div>
        <div className="flex gap-2 pt-2">
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Update Now
          </button>
          <button className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Later
          </button>
        </div>
      </div>
    </ToastWrapper>
  ),
};

export const AllTypes: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{id: number, type: string, title: string, message: string}>>([]);
    let nextId = 1;
    
    const addToast = (type: string, title: string, message: string) => {
      const id = nextId++;
      setToasts(prev => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={() => addToast("success", "Success", "Operation completed successfully")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Success Toast
          </button>
          <button 
            onClick={() => addToast("warning", "Warning", "Please review your settings")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Warning Toast
          </button>
          <button 
            onClick={() => addToast("error", "Error", "Something went wrong")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Error Toast
          </button>
          <button 
            onClick={() => addToast("info", "Info", "Here's some information")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Info Toast
          </button>
        </div>
        
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              isVisible={true}
              onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              type={toast.type as any}
              title={toast.title}
            >
              <p>{toast.message}</p>
            </Toast>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing all toast types with auto-dismiss functionality.",
      },
    },
  },
};

export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{id: number, type: string, title: string, message: string}>>([]);
    let nextId = 1;
    
    const addToast = (type: string, title: string, message: string) => {
      const id = nextId++;
      setToasts(prev => [...prev, { id, type, title, message }]);
    };
    
    const removeToast = (id: number) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={() => addToast("success", "Agent Deployed", "Voltage monitor agent deployed successfully")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Deploy Success
          </button>
          <button 
            onClick={() => addToast("warning", "High Usage", "CPU usage is above 80%")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            High Usage
          </button>
          <button 
            onClick={() => addToast("error", "Connection Lost", "Lost connection to PLC-001")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Connection Error
          </button>
          <button 
            onClick={() => addToast("info", "Update Available", "New firmware version 2.1.0 available")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Info
          </button>
        </div>
        
        <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              isVisible={true}
              onClose={() => removeToast(toast.id)}
              type={toast.type as any}
              title={toast.title}
            >
              <p>{toast.message}</p>
            </Toast>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demo showing multiple toasts stacking and individual dismissal.",
      },
    },
  },
}; 