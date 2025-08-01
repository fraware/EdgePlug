import React from 'react';
export interface ToastProps {
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose?: () => void;
    className?: string;
}
declare const Toast: React.FC<ToastProps>;
export default Toast;
//# sourceMappingURL=Toast.d.ts.map