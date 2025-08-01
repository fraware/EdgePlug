import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

// Custom Node Types
export interface PLCNodeData {
  label: string;
  type: 'plc';
  status: 'online' | 'offline' | 'error';
  signals: Array<{
    id: string;
    name: string;
    type: 'input' | 'output';
    value: number;
  }>;
}

export interface TransformerNodeData {
  label: string;
  type: 'transformer';
  voltage: number;
  current: number;
  efficiency: number;
}

export interface BreakerNodeData {
  label: string;
  type: 'breaker';
  status: 'open' | 'closed' | 'tripped';
  current: number;
  voltage: number;
}

export type CustomNodeData = PLCNodeData | TransformerNodeData | BreakerNodeData;

// PLC Node Component
const PLCNode: React.FC<{ data: PLCNodeData }> = ({ data }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg min-w-[200px]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', statusColors[data.status])} />
        <h3 className="font-semibold text-gray-800">{data.label}</h3>
        <span className="text-xs text-gray-500 uppercase">{data.type}</span>
      </div>
      
      <div className="space-y-2">
        {data.signals.map((signal) => (
          <div key={signal.id} className="flex justify-between text-sm">
            <span className="text-gray-600">{signal.name}</span>
            <span className={cn(
              'font-mono',
              signal.type === 'input' ? 'text-blue-600' : 'text-green-600'
            )}>
              {signal.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Transformer Node Component
const TransformerNode: React.FC<{ data: TransformerNodeData }> = ({ data }) => {
  return (
    <motion.div
      className="bg-white border-2 border-yellow-200 rounded-lg p-4 shadow-lg min-w-[200px]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <h3 className="font-semibold text-gray-800">{data.label}</h3>
        <span className="text-xs text-gray-500 uppercase">{data.type}</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Voltage:</span>
          <span className="font-mono text-blue-600">{data.voltage}V</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current:</span>
          <span className="font-mono text-green-600">{data.current}A</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Efficiency:</span>
          <span className="font-mono text-purple-600">{data.efficiency}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Breaker Node Component
const BreakerNode: React.FC<{ data: BreakerNodeData }> = ({ data }) => {
  const statusColors = {
    open: 'bg-red-500',
    closed: 'bg-green-500',
    tripped: 'bg-orange-500',
  };

  return (
    <motion.div
      className="bg-white border-2 border-red-200 rounded-lg p-4 shadow-lg min-w-[200px]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', statusColors[data.status])} />
        <h3 className="font-semibold text-gray-800">{data.label}</h3>
        <span className="text-xs text-gray-500 uppercase">{data.type}</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={cn(
            'font-semibold uppercase',
            statusColors[data.status].replace('bg-', 'text-')
          )}>
            {data.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current:</span>
          <span className="font-mono text-green-600">{data.current}A</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Voltage:</span>
          <span className="font-mono text-blue-600">{data.voltage}V</span>
        </div>
      </div>
    </motion.div>
  );
};

// Node Types
const nodeTypes: NodeTypes = {
  plc: PLCNode,
  transformer: TransformerNode,
  breaker: BreakerNode,
};

// Toolbox Component
interface ToolboxProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ onDragStart }) => {
  const nodeTypes = [
    { type: 'plc', label: 'PLC', icon: '⚙️' },
    { type: 'transformer', label: 'Transformer', icon: '⚡' },
    { type: 'breaker', label: 'Breaker', icon: '🔌' },
  ];

  return (
    <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Components</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <motion.div
            key={node.type}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-grab hover:bg-gray-50"
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">{node.icon}</span>
            <span className="text-sm text-gray-700">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
};

// Signal Map Drawer Component
interface SignalMapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: CustomNodeData;
}

const SignalMapDrawer: React.FC<SignalMapDrawerProps> = ({ isOpen, onClose, nodeData }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Signal Map</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              {nodeData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{nodeData.label}</h3>
                    <p className="text-sm text-gray-500">{nodeData.type}</p>
                  </div>
                  
                  {nodeData.type === 'plc' && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Signals</h4>
                      {nodeData.signals.map((signal) => (
                        <div key={signal.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="text-sm font-medium">{signal.name}</span>
                            <span className={cn(
                              'ml-2 text-xs px-2 py-1 rounded',
                              signal.type === 'input' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            )}>
                              {signal.type}
                            </span>
                          </div>
                          <span className="font-mono text-sm">{signal.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No node selected</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Canvas Component
export interface CanvasProps {
  className?: string;
  onNodeSelect?: (node: Node<CustomNodeData>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ className, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<CustomNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const getDefaultNodeData = (type: string): CustomNodeData => {
    switch (type) {
      case 'plc':
        return {
          label: 'PLC Controller',
          type: 'plc',
          status: 'online',
          signals: [
            { id: '1', name: 'Voltage Input', type: 'input', value: 230 },
            { id: '2', name: 'Current Input', type: 'input', value: 15 },
            { id: '3', name: 'Status Output', type: 'output', value: 1 },
          ],
        };
      case 'transformer':
        return {
          label: 'Power Transformer',
          type: 'transformer',
          voltage: 400,
          current: 100,
          efficiency: 95,
        };
      case 'breaker':
        return {
          label: 'Circuit Breaker',
          type: 'breaker',
          status: 'closed',
          current: 50,
          voltage: 230,
        };
      default:
        return {
          label: 'Unknown Device',
          type: 'plc',
          status: 'offline',
          signals: [],
        };
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={cn('w-full h-full', className)}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
          <MiniMap />
          <Toolbox onDragStart={onDragStart} />
        </ReactFlow>
        
        <SignalMapDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          nodeData={selectedNode?.data}
        />
      </ReactFlowProvider>
    </div>
  );
}; 