import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../utils/cn';
const Badge = ({ variant = 'neutral', size = 'md', children, className, ...props }) => {
    const baseClasses = [
        'inline-flex',
        'items-center',
        'font-medium',
        'rounded-full',
        'border',
        'transition-colors',
        'duration-150',
    ];
    const variantClasses = {
        primary: [
            'bg-ep-primary-100',
            'text-ep-primary-800',
            'border-ep-primary-200',
        ],
        secondary: [
            'bg-ep-secondary-100',
            'text-ep-secondary-800',
            'border-ep-secondary-200',
        ],
        success: [
            'bg-ep-success-100',
            'text-ep-success-800',
            'border-ep-success-200',
        ],
        warning: [
            'bg-ep-warning-100',
            'text-ep-warning-800',
            'border-ep-warning-200',
        ],
        error: [
            'bg-ep-error-100',
            'text-ep-error-800',
            'border-ep-error-200',
        ],
        neutral: [
            'bg-ep-neutral-100',
            'text-ep-neutral-800',
            'border-ep-neutral-200',
        ],
    };
    const sizeClasses = {
        sm: ['px-2', 'py-0.5', 'text-xs'],
        md: ['px-2.5', 'py-0.5', 'text-sm'],
        lg: ['px-3', 'py-1', 'text-base'],
    };
    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
    return (_jsx("span", { className: classes, ...props, children: children }));
};
export { Badge };
export default Badge;
//# sourceMappingURL=Badge.js.map