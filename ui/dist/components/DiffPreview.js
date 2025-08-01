import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
export const DiffPreview = ({ oldData, newData, className, showUnchanged = false, maxDepth = 5, onDiffClick, }) => {
    const [expandedPaths, setExpandedPaths] = useState(new Set());
    const [selectedPath, setSelectedPath] = useState([]);
    const diff = useMemo(() => {
        return generateDiff(oldData, newData, maxDepth);
    }, [oldData, newData, maxDepth]);
    const toggleExpanded = (path) => {
        const pathKey = path.join('.');
        const newExpanded = new Set(expandedPaths);
        if (newExpanded.has(pathKey)) {
            newExpanded.delete(pathKey);
        }
        else {
            newExpanded.add(pathKey);
        }
        setExpandedPaths(newExpanded);
    };
    const handleDiffClick = (path, change) => {
        setSelectedPath(path);
        onDiffClick?.(path, change);
    };
    const isExpanded = (path) => {
        return expandedPaths.has(path.join('.'));
    };
    const renderValue = (value, type) => {
        if (value === null)
            return _jsx("span", { className: "text-gray-500 italic", children: "null" });
        if (value === undefined)
            return _jsx("span", { className: "text-gray-500 italic", children: "undefined" });
        const valueType = typeof value;
        const valueStr = valueType === 'object' ? JSON.stringify(value, null, 2) : String(value);
        return (_jsx("span", { className: cn('font-mono text-sm', type === 'added' && 'text-green-700 bg-green-50', type === 'removed' && 'text-red-700 bg-red-50', type === 'modified' && 'text-blue-700 bg-blue-50', type === 'unchanged' && 'text-gray-600'), children: valueStr }));
    };
    const renderDiffNode = (change, depth = 0) => {
        const pathKey = change.path.join('.');
        const isExpandedNode = isExpanded(change.path);
        const hasChildren = change.children && change.children.length > 0;
        const isObject = change.newValue && typeof change.newValue === 'object' && !Array.isArray(change.newValue);
        const isArray = Array.isArray(change.newValue);
        if (!showUnchanged && change.type === 'unchanged' && !hasChildren) {
            return null;
        }
        return (_jsxs(motion.div, { className: cn('border-l-2 pl-4 py-1', change.type === 'added' && 'border-green-500', change.type === 'removed' && 'border-red-500', change.type === 'modified' && 'border-blue-500', change.type === 'unchanged' && 'border-gray-300', selectedPath.join('.') === pathKey && 'bg-blue-50'), initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, onClick: () => handleDiffClick(change.path, change), children: [_jsxs("div", { className: "flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1", children: [(isObject || isArray) && (_jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                toggleExpanded(change.path);
                            }, className: "w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700", children: isExpandedNode ? '▼' : '▶' })), _jsx(Badge, { variant: change.type === 'added' ? 'success' :
                                change.type === 'removed' ? 'error' :
                                    change.type === 'modified' ? 'warning' : 'neutral', size: "sm", children: change.type }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: change.path.length > 0 ? change.path[change.path.length - 1] : 'root' }), !isExpandedNode && (_jsx("div", { className: "flex-1", children: change.type === 'modified' ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "\u2192" }), renderValue(change.oldValue, 'removed'), _jsx("span", { className: "text-xs text-gray-500", children: "\u2192" }), renderValue(change.newValue, 'added')] })) : (renderValue(change.newValue || change.oldValue, change.type)) }))] }), isExpandedNode && hasChildren && (_jsx("div", { className: "mt-2 ml-4 space-y-1", children: change.children.map((child) => renderDiffNode(child, depth + 1)) })), isExpandedNode && (isObject || isArray) && !hasChildren && (_jsx("div", { className: "mt-2 ml-4", children: _jsx("pre", { className: "text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40", children: JSON.stringify(change.newValue, null, 2) }) }))] }, pathKey));
    };
    const stats = useMemo(() => {
        const countChanges = (changes) => {
            return changes.reduce((acc, change) => {
                acc[change.type]++;
                if (change.children) {
                    const childStats = countChanges(change.children);
                    acc.added += childStats.added;
                    acc.removed += childStats.removed;
                    acc.modified += childStats.modified;
                    acc.unchanged += childStats.unchanged;
                }
                return acc;
            }, { added: 0, removed: 0, modified: 0, unchanged: 0 });
        };
        return countChanges(diff);
    }, [diff]);
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "success", size: "sm", children: stats.added }), _jsx("span", { children: "added" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "error", size: "sm", children: stats.removed }), _jsx("span", { children: "removed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "warning", size: "sm", children: stats.modified }), _jsx("span", { children: "modified" })] }), showUnchanged && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "neutral", size: "sm", children: stats.unchanged }), _jsx("span", { children: "unchanged" })] }))] }), _jsx("div", { className: "border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-auto", children: diff.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-2xl mb-2", children: "\u2713" }), _jsx("p", { children: "No differences found" })] })) : (_jsx("div", { className: "space-y-1", children: diff.map((change) => renderDiffNode(change)) })) }), _jsxs("div", { className: "text-xs text-gray-500 space-y-1", children: [_jsx("p", { children: "\u2022 Green: Added values" }), _jsx("p", { children: "\u2022 Red: Removed values" }), _jsx("p", { children: "\u2022 Blue: Modified values" }), _jsx("p", { children: "\u2022 Gray: Unchanged values" }), _jsx("p", { children: "\u2022 Click on any change to select it" })] })] }));
};
function generateDiff(oldData, newData, maxDepth, currentPath = []) {
    if (currentPath.length >= maxDepth) {
        return [{
                type: 'modified',
                path: currentPath,
                oldValue: oldData,
                newValue: newData,
            }];
    }
    if (typeof oldData !== 'object' || typeof newData !== 'object') {
        if (oldData === newData) {
            return [{
                    type: 'unchanged',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
        else {
            return [{
                    type: 'modified',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
    }
    if (oldData === null || newData === null) {
        if (oldData === newData) {
            return [{
                    type: 'unchanged',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
        else {
            return [{
                    type: 'modified',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
    }
    if (Array.isArray(oldData) || Array.isArray(newData)) {
        if (!Array.isArray(oldData)) {
            return [{
                    type: 'modified',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
        if (!Array.isArray(newData)) {
            return [{
                    type: 'modified',
                    path: currentPath,
                    oldValue: oldData,
                    newValue: newData,
                }];
        }
        const maxLength = Math.max(oldData.length, newData.length);
        const changes = [];
        for (let i = 0; i < maxLength; i++) {
            const oldItem = oldData[i];
            const newItem = newData[i];
            const itemPath = [...currentPath, i.toString()];
            if (i >= oldData.length) {
                changes.push({
                    type: 'added',
                    path: itemPath,
                    newValue: newItem,
                });
            }
            else if (i >= newData.length) {
                changes.push({
                    type: 'removed',
                    path: itemPath,
                    oldValue: oldItem,
                });
            }
            else {
                const itemChanges = generateDiff(oldItem, newItem, maxDepth, itemPath);
                changes.push(...itemChanges);
            }
        }
        return changes;
    }
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    const changes = [];
    for (const key of allKeys) {
        const oldValue = oldData?.[key];
        const newValue = newData?.[key];
        const keyPath = [...currentPath, key];
        if (!(key in oldData)) {
            changes.push({
                type: 'added',
                path: keyPath,
                newValue,
            });
        }
        else if (!(key in newData)) {
            changes.push({
                type: 'removed',
                path: keyPath,
                oldValue,
            });
        }
        else {
            const keyChanges = generateDiff(oldValue, newValue, maxDepth, keyPath);
            if (keyChanges.length === 1 && keyChanges[0]?.type === 'unchanged') {
                changes.push(keyChanges[0]);
            }
            else {
                changes.push({
                    type: 'modified',
                    path: keyPath,
                    oldValue,
                    newValue,
                    children: keyChanges,
                });
            }
        }
    }
    return changes;
}
export const createDiff = (oldData, newData, maxDepth = 5) => {
    return generateDiff(oldData, newData, maxDepth);
};
export const getDiffStats = (diff) => {
    return diff.reduce((acc, change) => {
        acc[change.type]++;
        if (change.children) {
            const childStats = getDiffStats(change.children);
            acc.added += childStats.added;
            acc.removed += childStats.removed;
            acc.modified += childStats.modified;
            acc.unchanged += childStats.unchanged;
        }
        return acc;
    }, { added: 0, removed: 0, modified: 0, unchanged: 0 });
};
//# sourceMappingURL=DiffPreview.js.map