'use client';
import { ReactNode } from 'react';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * The single shared tab/toggle treatment for the app — one active/inactive
 * visual language (orange-tinted active pill) instead of each call site
 * inventing its own one-off active-state color.
 */
export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-0.5 rounded-[10px] w-fit ${className}`}
      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}
      role="tablist"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors"
          style={{
            background: value === opt.value ? 'rgba(255,115,0,0.14)' : 'transparent',
            color: value === opt.value ? 'var(--orange)' : 'var(--text-4)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
