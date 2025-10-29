/**
 * Button Component
 * Created by Gabriel
 * 
 * Reusable button component with multiple variants and sizes.
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const buttonClasses = [
        styles.button,
        styles[variant],
        size !== 'medium' && styles[size],
        fullWidth && styles.fullWidth,
        className
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
}

