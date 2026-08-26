'use client';
import { CSSProperties, ReactNode } from 'react';

interface IconChipProps {
  children: ReactNode;
  size?: number;
  radius?: number;
  /** Soft ember glow around the chip — on by default for the brand mark, turn
   *  off for dense/repeated uses (e.g. a table of node avatars) where a glow
   *  per-row would be too loud. */
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Shared chip shell for the brand mark and avatar-style icons. Previously this
 * exact gradient/border/glow recipe was hand-copied inline in three places
 * (MainLayout's mobile bar, Sidebar's logo, Sidebar's org avatar) plus a
 * differently-colored variant for node OS icons — one small drift between
 * copies and the "kit of parts, not a system" feeling creeps in. `style` can
 * override background/border/color/boxShadow for non-brand uses (e.g. per-OS
 * accent colors on node rows) while keeping the same shape/sizing contract.
 */
export function IconChip({ children, size = 28, radius, glow = true, className = '', style }: IconChipProps) {
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.32),
        background: 'linear-gradient(135deg, #1a0802, #3a1405)',
        border: '1px solid rgba(255,115,0,0.32)',
        boxShadow: glow ? '0 0 14px rgba(255,115,0,0.2)' : undefined,
        color: 'var(--orange)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
