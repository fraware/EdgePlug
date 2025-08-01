import React from 'react';
export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    'aria-label'?: string;
}
declare const Button: React.FC<ButtonProps>;
export { Button };
export default Button;
//# sourceMappingURL=Button.d.ts.map