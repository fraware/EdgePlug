import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
const Drawer = ({ isOpen, onClose, title, children, position = 'right', size = 'md', className, }) => {
    const drawerRef = useRef(null);
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
        md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
        lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
        xl: position === 'left' || position === 'right' ? 'w-[40rem]' : 'h-[40rem]',
    };
    const positionClasses = {
        left: [
            'fixed left-0 top-0 h-full',
            'transform transition-transform duration-300 ease-in-out',
            'translate-x-0',
        ],
        right: [
            'fixed right-0 top-0 h-full',
            'transform transition-transform duration-300 ease-in-out',
            'translate-x-0',
        ],
        top: [
            'fixed top-0 left-0 w-full',
            'transform transition-transform duration-300 ease-in-out',
            'translate-y-0',
        ],
        bottom: [
            'fixed bottom-0 left-0 w-full',
            'transform transition-transform duration-300 ease-in-out',
            'translate-y-0',
        ],
    };
    const backdropClasses = [
        'fixed inset-0 z-ep-modal-backdrop bg-black bg-opacity-50',
        'transition-opacity duration-300',
    ];
    const drawerClasses = cn('bg-white shadow-xl z-ep-modal', sizeClasses[size], positionClasses[position], 'focus:outline-none', className);
    return (_jsxs("div", { className: "fixed inset-0 z-ep-modal", children: [_jsx("div", { className: cn(backdropClasses), onClick: onClose, role: "presentation" }), _jsxs("div", { ref: drawerRef, className: drawerClasses, tabIndex: -1, role: "dialog", "aria-modal": "true", "aria-labelledby": "drawer-title", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-ep-neutral-200", children: [_jsx("h2", { id: "drawer-title", className: "text-lg font-semibold text-ep-neutral-900", children: title }), _jsx("button", { onClick: onClose, className: cn('inline-flex', 'items-center', 'justify-center', 'rounded-md', 'p-2', 'text-ep-neutral-400', 'hover:text-ep-neutral-500', 'hover:bg-ep-neutral-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-ep-primary-500', 'focus:ring-offset-2', 'transition-colors', 'duration-150'), "aria-label": "Close drawer", children: _jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: children })] })] }));
};
export default Drawer;
//# sourceMappingURL=Drawer.js.map