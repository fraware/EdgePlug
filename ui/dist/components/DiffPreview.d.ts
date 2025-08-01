import React from 'react';
export interface DiffChange {
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    path: string[];
    oldValue?: any;
    newValue?: any;
    children?: DiffChange[];
}
export interface DiffPreviewProps {
    oldData: any;
    newData: any;
    className?: string;
    showUnchanged?: boolean;
    maxDepth?: number;
    onDiffClick?: (path: string[], change: DiffChange) => void;
}
export declare const DiffPreview: React.FC<DiffPreviewProps>;
export declare const createDiff: (oldData: any, newData: any, maxDepth?: number) => DiffChange[];
export declare const getDiffStats: (diff: DiffChange[]) => {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
};
//# sourceMappingURL=DiffPreview.d.ts.map