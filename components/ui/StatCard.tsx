'use client';

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

/** Unified stat/bento tile used across Nodes, Routes, Keys and Users headers. */
export function StatCard({ label, value, color = 'var(--text-1)', glow = false, sub, delay = 0, trend }: StatCardProps) {
  const isHex = glow && color.startsWith('#');
  const bg = isHex
    ? `linear-gradient(135deg, ${hexToRgba(color, 0.15)} 0%, ${hexToRgba(color, 0.02)} 100%)`
    : 'rgba(255,255,255,0.02)';
  const border = isHex ? hexToRgba(color, 0.2) : 'rgba(255,255,255,0.06)';

  return (
    <div
      className="animate-fade-in-up lift-on-hover px-4 py-3 rounded-[12px] relative overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}`, animationDelay: `${delay}ms` }}
    >
      {isHex && (
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[30px] opacity-20"
          style={{ background: color, transform: 'translate(30%, -30%)' }}
        />
      )}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-3)', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div className="flex items-end gap-2 relative z-10">
        <div className="text-[22px] font-bold tracking-tight leading-none" style={{ color }}>{value}</div>
        {trend && <TrendPill trend={trend} />}
      </div>
      {sub && <p className="text-[11px] mt-2 relative z-10" style={{ color: 'var(--text-4)' }}>{sub}</p>}
    </div>
  );
}
