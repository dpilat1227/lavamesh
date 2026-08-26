'use client';
import { ReactNode } from 'react';

type BadgeVariant = 'green' | 'red' | 'amber' | 'purple' | 'blue' | 'orange' | 'ghost';

interface BadgeProps {
  variant?: BadgeVariant;
  /** Renders a small status dot in the badge's color before the label. */
  dot?: boolean;
  /** Animates the dot with the shared pulse-glow keyframe (use for "live/online" states only). */
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'ghost', dot = false, pulse = false, children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
            animation: pulse ? 'pulse-glow 2.5s ease-in-out infinite' : undefined,
          }}
        />
      )}
      {children}
    </span>
  );
}
