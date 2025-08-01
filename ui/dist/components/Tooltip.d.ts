import React from 'react';
export interface TooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
    className?: string;
    delay?: number;
}
declare const Tooltip: React.FC<TooltipProps>;
export default Tooltip;
//# sourceMappingURL=Tooltip.d.ts.map