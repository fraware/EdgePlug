import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    className?: string;
}
declare const Modal: React.FC<ModalProps>;
export { Modal };
export default Modal;
//# sourceMappingURL=Modal.d.ts.map