import React from 'react';
export interface BadgeProps {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
}
declare const Badge: React.FC<BadgeProps>;
export { Badge };
export default Badge;
//# sourceMappingURL=Badge.d.ts.map