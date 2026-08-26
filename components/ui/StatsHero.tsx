'use client';
import { Fragment, ReactNode } from 'react';

export interface HeroTrend {
  value: number;
  label?: string;
}

export interface HeroRing {
  value: number;
  total: number;
  /** Tiny caption under the center number, e.g. "online", "approved". */
  label: string;
}

export interface HeroMetric {
  label: string;
  value: ReactNode;
  valueColor?: string;
  trend?: HeroTrend;
}

/** The fleet-health-style ring: a filled arc for value/total. Reads well at any ratio,
 *  including small numbers (a full 2/2 ring still looks intentional, not empty). */
function Ring({ ring }: { ring: HeroRing }) {
  const { value, total, label } = ring;
  const size = 84;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = total > 0 ? value / total : 0;
  const dash = ratio * c;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* overflow:visible — the ring's stroke touches the viewBox edge with zero
          margin, so the drop-shadow glow below was getting hard-clipped by the
          SVG's default viewport clip, showing up as a faint square behind the
          circle. Letting the filter paint outside the box removes that artifact. */}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        {total > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--green)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(61,220,132,0.55))', transition: 'stroke-dasharray 0.7s var(--ease-out)' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-semibold leading-none tracking-tight" style={{ color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
          {total > 0 ? `${value}/${total}` : '0'}
        </span>
        <span className="text-[8.5px] font-semibold uppercase mt-1" style={{ color: 'var(--text-4)', letterSpacing: '0.12em' }}>{label}</span>
      </div>
    </div>
  );
}

function TrendPill({ trend }: { trend: HeroTrend }) {
  const up = trend.value > 0;
  const flat = trend.value === 0;
  const tone = flat ? 'var(--text-4)' : up ? 'var(--green)' : 'var(--red)';
  const bg = flat ? 'rgba(255,255,255,0.04)' : up ? 'var(--green-soft)' : 'var(--red-soft)';
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: tone, background: bg }} title={trend.label}>
      {!flat && (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
      {Math.abs(trend.value).toFixed(1)}%
    </span>
  );
}

function Metric({ label, value, valueColor = 'var(--text-1)', trend }: HeroMetric) {
  return (
    <div className="min-w-0">
      {/* Label is deliberately quieter (lighter weight, tighter tracking) than the
          old treatment so the jump to the big numeral reads as real contrast,
          not "two things shouting at the same volume." */}
      <p className="text-[10px] font-medium uppercase mb-1.5" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-semibold tracking-tight leading-none" style={{ color: valueColor, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {trend && <TrendPill trend={trend} />}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden md:block self-stretch w-px my-0.5" style={{ background: 'var(--border-1)' }} />;
}

/**
 * The single "main stat" panel pattern shared across fleet pages (Dashboard, Routes):
 * an optional health ring (owns the one true ratio for the page — don't repeat it
 * elsewhere on the page) plus divider-separated, caption-free numbers. Deliberately
 * terse — no per-metric sub-captions — to avoid the "wordy/cluttered" trap.
 *
 * `chart` fills the panel's trailing space with a real data visualization (e.g. an
 * uptime sparkline) instead of leaving it empty — the old version just stopped after
 * the last metric, leaving a dead gap on wide screens. The panel also carries a
 * resting shadow (not just on hover) so it reads as a floating focal panel rather
 * than a pasted rectangle — the one card per page that earns that treatment.
 */
export function StatsHero({ ring, metrics, chart, className = '' }: { ring?: HeroRing; metrics: HeroMetric[]; chart?: ReactNode; className?: string }) {
  return (
    <div
      className={`animate-fade-in-up rounded-[16px] px-6 py-5 ${className}`}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-1)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-7 md:gap-9 flex-wrap">
        {ring && (
          <>
            <Ring ring={ring} />
            <Divider />
          </>
        )}
        {metrics.map((m, i) => (
          <Fragment key={m.label}>
            <Metric {...m} />
            {i < metrics.length - 1 && <Divider />}
          </Fragment>
        ))}
        {chart && (
          <>
            <Divider />
            {chart}
          </>
        )}
      </div>
    </div>
  );
}
