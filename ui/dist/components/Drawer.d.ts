import React from 'react';
export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    position?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}
declare const Drawer: React.FC<DrawerProps>;
export default Drawer;
//# sourceMappingURL=Drawer.d.ts.map