import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils/cn';
const Button = ({ variant = 'primary', size = 'md', disabled = false, loading = false, icon, children, onClick, type = 'button', className, 'aria-label': ariaLabel, ...props }) => {
    const baseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-md',
        'transition-all',
        'duration-150',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
        'active:scale-95',
    ];
    const variantClasses = {
        primary: [
            'bg-ep-primary-800',
            'text-white',
            'hover:bg-ep-primary-700',
            'focus:ring-ep-primary-500',
            'border',
            'border-ep-primary-800',
        ],
        secondary: [
            'bg-ep-secondary-500',
            'text-white',
            'hover:bg-ep-secondary-600',
            'focus:ring-ep-secondary-500',
            'border',
            'border-ep-secondary-500',
        ],
        success: [
            'bg-ep-success-500',
            'text-white',
            'hover:bg-ep-success-600',
            'focus:ring-ep-success-500',
            'border',
            'border-ep-success-500',
        ],
        warning: [
            'bg-ep-warning-500',
            'text-white',
            'hover:bg-ep-warning-600',
            'focus:ring-ep-warning-500',
            'border',
            'border-ep-warning-500',
        ],
        error: [
            'bg-ep-error-500',
            'text-white',
            'hover:bg-ep-error-600',
            'focus:ring-ep-error-500',
            'border',
            'border-ep-error-500',
        ],
        ghost: [
            'bg-transparent',
            'text-ep-neutral-700',
            'hover:bg-ep-neutral-100',
            'focus:ring-ep-neutral-500',
            'border',
            'border-transparent',
            'hover:border-ep-neutral-300',
        ],
    };
    const sizeClasses = {
        sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
        md: ['px-4', 'py-2', 'text-base', 'gap-2'],
        lg: ['px-6', 'py-3', 'text-lg', 'gap-2.5'],
    };
    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };
    return (_jsxs("button", { type: type, className: classes, disabled: disabled || loading, onClick: handleClick, "aria-label": ariaLabel, "aria-disabled": disabled || loading, ...props, children: [loading && (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), !loading && icon && _jsx("span", { className: "flex-shrink-0", children: icon }), _jsx("span", { className: "flex-shrink-0", children: children })] }));
};
export { Button };
export default Button;
//# sourceMappingURL=Button.js.map