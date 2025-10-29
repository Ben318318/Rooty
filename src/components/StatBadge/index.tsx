/**
 * StatBadge Component
 * Created by Nick
 * 
 * Displays a statistic with an icon and label.
 */

import styles from './StatBadge.module.css';

interface StatBadgeProps {
    icon: string;
    value: string | number;
    label: string;
    variant?: 'default' | 'success' | 'info' | 'warning';
}

export default function StatBadge({ 
    icon, 
    value, 
    label, 
    variant = 'default' 
}: StatBadgeProps) {
    const badgeClasses = [
        styles.statBadge,
        variant !== 'default' && styles[variant]
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={badgeClasses}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.value}>{value}</div>
            <div className={styles.label}>{label}</div>
        </div>
    );
}

