import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { Badge } from './Badge';

// Types
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

// Diff Preview Component
export const DiffPreview: React.FC<DiffPreviewProps> = ({
  oldData,
  newData,
  className,
  showUnchanged = false,
  maxDepth = 5,
  onDiffClick,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Generate diff using jsondiffpatch-like logic
  const diff = useMemo(() => {
    return generateDiff(oldData, newData, maxDepth);
  }, [oldData, newData, maxDepth]);

  const toggleExpanded = (path: string[]) => {
    const pathKey = path.join('.');
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey);
    } else {
      newExpanded.add(pathKey);
    }
    setExpandedPaths(newExpanded);
  };

  const handleDiffClick = (path: string[], change: DiffChange) => {
    setSelectedPath(path);
    onDiffClick?.(path, change);
  };

  const isExpanded = (path: string[]) => {
    return expandedPaths.has(path.join('.'));
  };

  const renderValue = (value: any, type: 'added' | 'removed' | 'modified' | 'unchanged') => {
    if (value === null) return <span className="text-gray-500 italic">null</span>;
    if (value === undefined) return <span className="text-gray-500 italic">undefined</span>;
    
    const valueType = typeof value;
    const valueStr = valueType === 'object' ? JSON.stringify(value, null, 2) : String(value);
    
    return (
      <span
        className={cn(
          'font-mono text-sm',
          type === 'added' && 'text-green-700 bg-green-50',
          type === 'removed' && 'text-red-700 bg-red-50',
          type === 'modified' && 'text-blue-700 bg-blue-50',
          type === 'unchanged' && 'text-gray-600'
        )}
      >
        {valueStr}
      </span>
    );
  };

  const renderDiffNode = (change: DiffChange, depth: number = 0): React.ReactNode => {
    const pathKey = change.path.join('.');
    const isExpandedNode = isExpanded(change.path);
    const hasChildren = change.children && change.children.length > 0;
    const isObject = change.newValue && typeof change.newValue === 'object' && !Array.isArray(change.newValue);
    const isArray = Array.isArray(change.newValue);

    if (!showUnchanged && change.type === 'unchanged' && !hasChildren) {
      return null;
    }

    return (
      <motion.div
        key={pathKey}
        className={cn(
          'border-l-2 pl-4 py-1',
          change.type === 'added' && 'border-green-500',
          change.type === 'removed' && 'border-red-500',
          change.type === 'modified' && 'border-blue-500',
          change.type === 'unchanged' && 'border-gray-300',
          selectedPath.join('.') === pathKey && 'bg-blue-50'
        )}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => handleDiffClick(change.path, change)}
      >
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
          {/* Expand/Collapse button */}
          {(isObject || isArray) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(change.path);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpandedNode ? '▼' : '▶'}
            </button>
          )}

          {/* Change type badge */}
          <Badge
            variant={
              change.type === 'added' ? 'success' :
              change.type === 'removed' ? 'error' :
              change.type === 'modified' ? 'warning' : 'neutral'
            }
            size="sm"
          >
            {change.type}
          </Badge>

          {/* Path */}
          <span className="text-sm font-medium text-gray-700">
            {change.path.length > 0 ? change.path[change.path.length - 1] : 'root'}
          </span>

          {/* Value preview */}
          {!isExpandedNode && (
            <div className="flex-1">
              {change.type === 'modified' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">→</span>
                  {renderValue(change.oldValue, 'removed')}
                  <span className="text-xs text-gray-500">→</span>
                  {renderValue(change.newValue, 'added')}
                </div>
              ) : (
                renderValue(change.newValue || change.oldValue, change.type)
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {isExpandedNode && hasChildren && (
          <div className="mt-2 ml-4 space-y-1">
            {change.children!.map((child) => renderDiffNode(child, depth + 1))}
          </div>
        )}

        {/* Object/Array content when expanded */}
        {isExpandedNode && (isObject || isArray) && !hasChildren && (
          <div className="mt-2 ml-4">
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(change.newValue, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    );
  };

  const stats = useMemo(() => {
    const countChanges = (changes: DiffChange[]): { added: number; removed: number; modified: number; unchanged: number } => {
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">{stats.added}</Badge>
          <span>added</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="error" size="sm">{stats.removed}</Badge>
          <span>removed</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">{stats.modified}</Badge>
          <span>modified</span>
        </div>
        {showUnchanged && (
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">{stats.unchanged}</Badge>
            <span>unchanged</span>
          </div>
        )}
      </div>

      {/* Diff Tree */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-auto">
        {diff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">✓</div>
            <p>No differences found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {diff.map((change) => renderDiffNode(change))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Green: Added values</p>
        <p>• Red: Removed values</p>
        <p>• Blue: Modified values</p>
        <p>• Gray: Unchanged values</p>
        <p>• Click on any change to select it</p>
      </div>
    </div>
  );
};

// Helper function to generate diff
function generateDiff(oldData: any, newData: any, maxDepth: number, currentPath: string[] = []): DiffChange[] {
  if (currentPath.length >= maxDepth) {
    return [{
      type: 'modified',
      path: currentPath,
      oldValue: oldData,
      newValue: newData,
    }];
  }

  // Handle primitive values
  if (typeof oldData !== 'object' || typeof newData !== 'object') {
    if (oldData === newData) {
      return [{
        type: 'unchanged',
        path: currentPath,
        oldValue: oldData,
        newValue: newData,
      }];
    } else {
      return [{
        type: 'modified',
        path: currentPath,
        oldValue: oldData,
        newValue: newData,
      }];
    }
  }

  // Handle null/undefined
  if (oldData === null || newData === null) {
    if (oldData === newData) {
      return [{
        type: 'unchanged',
        path: currentPath,
        oldValue: oldData,
        newValue: newData,
      }];
    } else {
      return [{
        type: 'modified',
        path: currentPath,
        oldValue: oldData,
        newValue: newData,
      }];
    }
  }

  // Handle arrays
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
    const changes: DiffChange[] = [];

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
      } else if (i >= newData.length) {
        changes.push({
          type: 'removed',
          path: itemPath,
          oldValue: oldItem,
        });
      } else {
        const itemChanges = generateDiff(oldItem, newItem, maxDepth, itemPath);
        changes.push(...itemChanges);
      }
    }

    return changes;
  }

  // Handle objects
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  const changes: DiffChange[] = [];

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
    } else if (!(key in newData)) {
      changes.push({
        type: 'removed',
        path: keyPath,
        oldValue,
      });
    } else {
      const keyChanges = generateDiff(oldValue, newValue, maxDepth, keyPath);
      if (keyChanges.length === 1 && keyChanges[0].type === 'unchanged') {
        changes.push(keyChanges[0]);
      } else {
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

// Export helper functions
export const createDiff = (oldData: any, newData: any, maxDepth: number = 5): DiffChange[] => {
  return generateDiff(oldData, newData, maxDepth);
};

export const getDiffStats = (diff: DiffChange[]): { added: number; removed: number; modified: number; unchanged: number } => {
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