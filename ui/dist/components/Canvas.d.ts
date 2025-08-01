import React from 'react';
import { Node } from 'reactflow';
import 'reactflow/dist/style.css';
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
export interface CanvasProps {
    className?: string;
    onNodeSelect?: (node: Node<CustomNodeData>) => void;
}
export declare const Canvas: React.FC<CanvasProps>;
//# sourceMappingURL=Canvas.d.ts.map