'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  /** CSS color for the value text. Pass a hex string (e.g. "#a78bfa") to enable `glow`. */
  color?: string;
  /** Lambda-style bento treatment: soft gradient background, colored border, and a blurred orb. Requires a hex `color`. */
  glow?: boolean;
  /** Lambda-style numbered spec index ("01", "02"...) rendered top-right, e.g. for a fact-sheet feel. */
  index?: number;
  sub?: string;
  delay?: number;
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

/** Unified stat/bento tile used across Nodes, Routes, Keys and Users headers. */
export function StatCard({ label, value, color = 'var(--text-1)', glow = false, index, sub, delay = 0 }: StatCardProps) {
  const isHex = glow && color.startsWith('#');
  const bg = isHex
    ? `linear-gradient(135deg, ${hexToRgba(color, 0.15)} 0%, ${hexToRgba(color, 0.02)} 100%)`
    : 'rgba(255,255,255,0.02)';
  const border = isHex ? hexToRgba(color, 0.2) : 'rgba(255,255,255,0.06)';

  return (
    <div
      className="animate-fade-in-up px-5 py-4 rounded-[12px] relative overflow-hidden"
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
        {typeof index === 'number' && <span className="spec-index">{String(index).padStart(2, '0')}</span>}
      </div>
      <div className="text-[28px] font-bold tracking-tight leading-none relative z-10" style={{ color }}>{value}</div>
      {sub && <p className="text-[11px] mt-2 relative z-10" style={{ color: 'var(--text-4)' }}>{sub}</p>}
    </div>
  );
}
