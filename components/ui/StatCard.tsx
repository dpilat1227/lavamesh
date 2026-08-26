'use client';
import { ReactNode } from 'react';

interface TrendProps {
  /** Signed percentage-point (or unit) change vs. the prior comparable window. */
  value: number;
  /** Optional context label, e.g. "vs. yesterday". */
  label?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  /** CSS color for the value text. Pass a hex string (e.g. "#a78bfa") to enable `glow`. */
  color?: string;
  /** Lambda-style bento treatment: soft gradient background, colored border, and a blurred orb. Requires a hex `color`. */
  glow?: boolean;
  sub?: string;
  delay?: number;
  /** Copilot-style delta pill — up/down arrow + value, colored green/red by sign. */
  trend?: TrendProps;
  /** Metric glyph shown in a tinted chip; pass `accent` to color the chip. */
  icon?: ReactNode;
  /** Hex accent for the icon chip (and a faint corner wash). e.g. "#3ddc84". */
  accent?: string;
  /** 0–1 ratio bar under the value (e.g. online / total). Uses `color` when omitted. */
  progress?: number;
  /** Override the progress bar fill color; defaults to the value `color`. */
  progressColor?: string;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Small up/down delta pill — Copilot Money's cash-flow-trend pattern. */
function TrendPill({ trend }: { trend: TrendProps }) {
  const up = trend.value > 0;
  const flat = trend.value === 0;
  const tone = flat ? 'var(--text-4)' : up ? 'var(--green)' : 'var(--red)';
  const bg = flat ? 'rgba(255,255,255,0.04)' : up ? 'var(--green-soft)' : 'var(--red-soft)';
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold relative z-10"
      style={{ color: tone, background: bg }}
      title={trend.label}
    >
      {!flat && (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
      {Math.abs(trend.value).toFixed(1)}{typeof trend.value === 'number' && Number.isInteger(trend.value) ? '' : ''}%
    </span>
  );
}

/**
 * Compact, horizontal metric tile (Copilot-style): a tinted icon chip, a
 * value-first line, and a small caption. Deliberately short (~60px) so a row
 * of these reads as a dense summary strip, not four half-empty billboards.
 * `progress` renders as a hairline accent along the bottom edge (adds meaning
 * for real ratios like online/total without adding height).
 */
export function StatCard({ label, value, color = 'var(--text-1)', glow = false, sub, delay = 0, trend, icon, accent, progress, progressColor }: StatCardProps) {
  const isHex = glow && color.startsWith('#');
  const cardBg = isHex
    ? `linear-gradient(135deg, ${hexToRgba(color, 0.13)} 0%, rgba(255,255,255,0.02) 62%)`
    : 'var(--surface-card)';
  const cardBorder = isHex ? hexToRgba(color, 0.22) : 'var(--border-1)';
  const chipColor = accent ?? (color.startsWith('#') ? color : 'var(--text-3)');
  const chipBg = accent ? hexToRgba(accent, 0.14) : 'var(--surface-3)';
  const chipBorder = accent ? hexToRgba(accent, 0.24) : 'var(--border-2)';
  const barColor = progressColor ?? accent ?? (color.startsWith('#') ? color : 'var(--text-3)');

  return (
    <div
      className="animate-fade-in-up lift-on-hover relative overflow-hidden rounded-[14px] px-3.5 py-3 flex items-center gap-3"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, animationDelay: `${delay}ms` }}
    >
      {icon && (
        <span
          className="flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: chipBg, border: `1px solid ${chipBorder}`, color: chipColor }}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[21px] font-bold tracking-tight leading-none" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          {trend && <TrendPill trend={trend} />}
        </div>
        <p className="text-[11px] mt-1 truncate">
          <span className="font-semibold uppercase" style={{ color: 'var(--text-3)', letterSpacing: '0.06em' }}>{label}</span>
          {sub && <span style={{ color: 'var(--text-4)' }}> · {sub}</span>}
        </p>
      </div>
      {typeof progress === 'number' && (
        <div className="absolute left-0 bottom-0 h-[3px] w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, background: barColor }} />
        </div>
      )}
    </div>
  );
}
