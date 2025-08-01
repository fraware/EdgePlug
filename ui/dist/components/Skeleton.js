import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils/cn';
export const Skeleton = ({ className, variant = 'text', size = 'md', width, height, lines = 1, }) => {
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
        return (_jsx("div", { className: "space-y-2", children: Array.from({ length: lines }).map((_, index) => (_jsx("div", { className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className), style: {
                    width: width || (index === lines - 1 ? '60%' : '100%'),
                    height: height || sizeClasses[size],
                } }, index))) }));
    }
    return (_jsx("div", { className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className), style: {
            width: width || '100%',
            height: height || sizeClasses[size],
        } }));
};
export const SkeletonText = ({ lines = 3, className, }) => (_jsx("div", { className: cn("space-y-2", className), children: Array.from({ length: lines }).map((_, index) => (_jsx(Skeleton, { variant: "text", size: "md", width: index === lines - 1 ? '60%' : '100%' }, index))) }));
export const SkeletonAvatar = ({ size = 'md', className, }) => {
    const sizeMap = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    return (_jsx(Skeleton, { variant: "circular", className: cn(sizeMap[size], className) }));
};
export const SkeletonCard = ({ className }) => (_jsxs("div", { className: cn("p-4 border border-gray-200 rounded-lg bg-white", className), children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx(SkeletonAvatar, { size: "md" }), _jsxs("div", { className: "flex-1", children: [_jsx(Skeleton, { size: "lg", className: "mb-2" }), _jsx(Skeleton, { size: "sm", width: "60%" })] })] }), _jsx(SkeletonText, { lines: 2 })] }));
export const SkeletonTable = ({ rows = 5, columns = 4, className, }) => (_jsxs("div", { className: cn("space-y-2", className), children: [_jsx("div", { className: "flex space-x-4 pb-2 border-b border-gray-200", children: Array.from({ length: columns }).map((_, index) => (_jsx(Skeleton, { size: "md", width: "100%" }, index))) }), Array.from({ length: rows }).map((_, rowIndex) => (_jsx("div", { className: "flex space-x-4 py-2", children: Array.from({ length: columns }).map((_, colIndex) => (_jsx(Skeleton, { size: "sm", width: "100%" }, colIndex))) }, rowIndex)))] }));
export const SkeletonList = ({ items = 3, className, }) => (_jsx("div", { className: cn("space-y-4", className), children: Array.from({ length: items }).map((_, index) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(SkeletonAvatar, { size: "sm" }), _jsxs("div", { className: "flex-1", children: [_jsx(Skeleton, { size: "md", className: "mb-1" }), _jsx(Skeleton, { size: "sm", width: "40%" })] })] }, index))) }));
//# sourceMappingURL=Skeleton.js.map