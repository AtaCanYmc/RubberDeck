import type { ReactNode } from 'react';

interface HardwareCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'hazard';
}

export function HardwareCard({
  children,
  className = '',
  variant = 'default',
}: HardwareCardProps) {
  const base =
    variant === 'elevated'
      ? 'hw-surface-elevated'
      : variant === 'hazard'
        ? 'hw-surface border-amber-500/25'
        : 'hw-surface';

  return <div className={`rounded-xl ${base} ${className}`}>{children}</div>;
}
