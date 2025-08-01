import React from 'react';
export interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    width?: string | number;
    height?: string | number;
    lines?: number;
}
export declare const Skeleton: React.FC<SkeletonProps>;
export declare const SkeletonText: React.FC<{
    lines?: number;
    className?: string;
}>;
export declare const SkeletonAvatar: React.FC<{
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}>;
export declare const SkeletonCard: React.FC<{
    className?: string;
}>;
export declare const SkeletonTable: React.FC<{
    rows?: number;
    columns?: number;
    className?: string;
}>;
export declare const SkeletonList: React.FC<{
    items?: number;
    className?: string;
}>;
//# sourceMappingURL=Skeleton.d.ts.map