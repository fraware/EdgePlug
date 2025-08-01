import React from 'react';
export interface GuardTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMute: (duration: number) => void;
    errorCount: number;
    errorType: string;
    className?: string;
}
export declare const GuardTripModal: React.FC<GuardTripModalProps>;
//# sourceMappingURL=GuardTripModal.d.ts.map