'use client';
import { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** Any CSS color — renders a 2px gradient accent bar across the top of the card. */
  accent?: string;
  className?: string;
  style?: CSSProperties;
  padded?: boolean;
}

/** The subtle bordered panel used throughout the context pane / inspector and settings surfaces. */
export function Card({ children, accent, className = '', style, padded = true }: CardProps) {
  return (
    <div
      className={`rounded-[12px] overflow-hidden ${className}`}
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-1)', ...style }}
    >
      {accent && (
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
