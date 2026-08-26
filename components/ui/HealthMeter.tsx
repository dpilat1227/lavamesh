'use client';

export interface MeterSegment {
  label: string;
  count: number;
  color: string;
}

/**
 * Compact status strip — answers "is everything ok?" without a row of empty stat
 * tiles. v2: a thicker bar with a soft per-segment glow and a subtle gradient fill
 * (instead of a flat 6px sliver) so it reads as a deliberate, vibrant data-viz
 * rather than a thin decorative line.
 */
export function HealthMeter({ segments }: { segments: MeterSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const widthOf = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return (
    <div
      className="rounded-[12px] px-4 py-3.5"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-1)' }}
    >
      <div className="flex h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {segments.map(s => (
          s.count > 0 ? (
            <div
              key={s.label}
              style={{
                width: `${widthOf(s.count)}%`,
                minWidth: 6,
                background: `linear-gradient(180deg, color-mix(in srgb, ${s.color} 82%, white 18%) 0%, ${s.color} 100%)`,
                boxShadow: `0 0 10px color-mix(in srgb, ${s.color} 55%, transparent), 0 0 1px color-mix(in srgb, ${s.color} 70%, transparent)`,
              }}
            />
          ) : null
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map(s => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11px] tabular-nums" style={{ color: 'var(--text-3)' }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: s.count ? s.color : 'var(--text-4)',
                boxShadow: s.count ? `0 0 6px color-mix(in srgb, ${s.color} 70%, transparent)` : 'none',
              }}
            />
            <span className="font-semibold" style={{ color: s.count ? s.color : 'var(--text-4)' }}>{s.count}</span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
