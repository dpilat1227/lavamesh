'use client';

export interface MeterSegment {
  label: string;
  count: number;
  color: string;
}

/** Compact status strip — answers "is everything ok?" without a row of empty stat tiles. */
export function HealthMeter({ segments }: { segments: MeterSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const widthOf = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return (
    <div
      className="rounded-[12px] px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {segments.map(s => (
          s.count > 0 ? (
            <div
              key={s.label}
              style={{ width: `${widthOf(s.count)}%`, background: s.color, minWidth: s.count ? 4 : 0 }}
            />
          ) : null
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map(s => (
          <span key={s.label} className="text-[11px] tabular-nums" style={{ color: 'var(--text-3)' }}>
            <span className="font-semibold" style={{ color: s.count ? s.color : 'var(--text-4)' }}>{s.count}</span>
            {' '}{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
