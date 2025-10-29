/**
 * TextInput Component
 * Created by Nick
 * 
 * Reusable text input with error states and validation.
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ error = false, className = '', ...props }, ref) => {
        const inputClasses = [
            styles.input,
            error && styles.error,
            className
        ]
            .filter(Boolean)
            .join(' ');

        return <input ref={ref} className={inputClasses} {...props} />;
    }
);

TextInput.displayName = 'TextInput';

export default TextInput;

