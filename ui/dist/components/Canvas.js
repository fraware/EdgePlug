import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState, ReactFlowProvider, Controls, Background, MiniMap, Panel, } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
const PLCNode = ({ data }) => {
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-500',
        error: 'bg-red-500',
    };
    return (_jsxs(motion.div, { className: "bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg min-w-[200px]", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: cn('w-3 h-3 rounded-full', statusColors[data.status]) }), _jsx("h3", { className: "font-semibold text-gray-800", children: data.label }), _jsx("span", { className: "text-xs text-gray-500 uppercase", children: data.type })] }), _jsx("div", { className: "space-y-2", children: data.signals.map((signal) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: signal.name }), _jsx("span", { className: cn('font-mono', signal.type === 'input' ? 'text-blue-600' : 'text-green-600'), children: signal.value })] }, signal.id))) })] }));
};
const TransformerNode = ({ data }) => {
    return (_jsxs(motion.div, { className: "bg-white border-2 border-yellow-200 rounded-lg p-4 shadow-lg min-w-[200px]", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("h3", { className: "font-semibold text-gray-800", children: data.label }), _jsx("span", { className: "text-xs text-gray-500 uppercase", children: data.type })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Voltage:" }), _jsxs("span", { className: "font-mono text-blue-600", children: [data.voltage, "V"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Current:" }), _jsxs("span", { className: "font-mono text-green-600", children: [data.current, "A"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Efficiency:" }), _jsxs("span", { className: "font-mono text-purple-600", children: [data.efficiency, "%"] })] })] })] }));
};
const BreakerNode = ({ data }) => {
    const statusColors = {
        open: 'bg-red-500',
        closed: 'bg-green-500',
        tripped: 'bg-orange-500',
    };
    return (_jsxs(motion.div, { className: "bg-white border-2 border-red-200 rounded-lg p-4 shadow-lg min-w-[200px]", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: cn('w-3 h-3 rounded-full', statusColors[data.status]) }), _jsx("h3", { className: "font-semibold text-gray-800", children: data.label }), _jsx("span", { className: "text-xs text-gray-500 uppercase", children: data.type })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), _jsx("span", { className: cn('font-semibold uppercase', statusColors[data.status].replace('bg-', 'text-')), children: data.status })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Current:" }), _jsxs("span", { className: "font-mono text-green-600", children: [data.current, "A"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Voltage:" }), _jsxs("span", { className: "font-mono text-blue-600", children: [data.voltage, "V"] })] })] })] }));
};
const nodeTypes = {
    plc: PLCNode,
    transformer: TransformerNode,
    breaker: BreakerNode,
};
const Toolbox = ({ onDragStart }) => {
    const nodeTypes = [
        { type: 'plc', label: 'PLC', icon: '⚙️' },
        { type: 'transformer', label: 'Transformer', icon: '⚡' },
        { type: 'breaker', label: 'Breaker', icon: '🔌' },
    ];
    return (_jsxs(Panel, { position: "top-left", className: "bg-white rounded-lg shadow-lg p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Components" }), _jsx("div", { className: "space-y-2", children: nodeTypes.map((node) => (_jsxs(motion.div, { className: "flex items-center gap-2 p-2 rounded border border-gray-200 cursor-grab hover:bg-gray-50", draggable: true, onDragStart: (event) => onDragStart(event, node.type), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsx("span", { className: "text-lg", children: node.icon }), _jsx("span", { className: "text-sm text-gray-700", children: node.label })] }, node.type))) })] }));
};
const SignalMapDrawer = ({ isOpen, onClose, nodeData }) => {
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsx(motion.div, { className: "fixed inset-0 bg-black bg-opacity-50", onClick: onClose }), _jsxs(motion.div, { className: "relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden", initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 }, transition: { type: 'spring', damping: 25, stiffness: 300 }, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Signal Map" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\u2715" })] }), _jsx("div", { className: "p-4", children: nodeData ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: nodeData.label }), _jsx("p", { className: "text-sm text-gray-500", children: nodeData.type })] }), nodeData.type === 'plc' && (_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Signals" }), nodeData.signals.map((signal) => (_jsxs("div", { className: "flex justify-between items-center p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: signal.name }), _jsx("span", { className: cn('ml-2 text-xs px-2 py-1 rounded', signal.type === 'input' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'), children: signal.type })] }), _jsx("span", { className: "font-mono text-sm", children: signal.value })] }, signal.id)))] }))] })) : (_jsx("p", { className: "text-gray-500", children: "No node selected" })) })] })] })) }));
};
export const Canvas = ({ className, onNodeSelect }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type || !reactFlowInstance)
            return;
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: getDefaultNodeData(type),
        };
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);
    const onNodeDoubleClick = useCallback((event, node) => {
        setSelectedNode(node);
        setIsDrawerOpen(true);
        onNodeSelect?.(node);
    }, [onNodeSelect]);
    const getDefaultNodeData = (type) => {
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
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };
    return (_jsx("div", { className: cn('w-full h-full', className), children: _jsxs(ReactFlowProvider, { children: [_jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onInit: setReactFlowInstance, onDrop: onDrop, onDragOver: onDragOver, onNodeDoubleClick: onNodeDoubleClick, nodeTypes: nodeTypes, fitView: true, attributionPosition: "bottom-left", children: [_jsx(Controls, {}), _jsx(Background, {}), _jsx(MiniMap, {}), _jsx(Toolbox, { onDragStart: onDragStart })] }), _jsx(SignalMapDrawer, { isOpen: isDrawerOpen, onClose: () => setIsDrawerOpen(false), nodeData: selectedNode?.data })] }) }));
};
//# sourceMappingURL=Canvas.js.map