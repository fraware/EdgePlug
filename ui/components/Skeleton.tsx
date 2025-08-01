import React from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  size = 'md',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const sizeClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              className
            )}
            style={{
              width: width || (index === lines - 1 ? '60%' : '100%'),
              height: height || sizeClasses[size],
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={{
        width: width || '100%',
        height: height || sizeClasses[size],
      }}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        size="md"
        width={index === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeMap[size], className)}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-4 border border-gray-200 rounded-lg bg-white", className)}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar size="md" />
      <div className="flex-1">
        <Skeleton size="lg" className="mb-2" />
        <Skeleton size="sm" width="60%" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    {/* Header */}
    <div className="flex space-x-4 pb-2 border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} size="md" width="100%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} size="sm" width="100%" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className,
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <SkeletonAvatar size="sm" />
        <div className="flex-1">
          <Skeleton size="md" className="mb-1" />
          <Skeleton size="sm" width="40%" />
        </div>
      </div>
    ))}
  </div>
); 