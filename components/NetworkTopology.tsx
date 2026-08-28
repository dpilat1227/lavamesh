'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

interface TopoNode {
  id: string;
  name: string;
  online: boolean;
  user?: string;
  ip?: string;
}

/**
 * Canvas is sized in real container pixels (via ResizeObserver), not a fixed
 * viewBox scaled to fit. A fixed viewBox looked fine on a wide desktop card
 * but shrank text/dots to mush once the card was only ~340px wide on a phone.
 * Height grows with node count instead of shrinking the radius, so a busy
 * mesh gets more room instead of getting more cramped.
 */
function layoutNodes(nodes: TopoNode[], width: number) {
  const n = nodes.length;
  if (n === 0) return { positions: [] as (TopoNode & { x: number; y: number })[], width, height: 200, cx: width / 2, cy: 90 };

  if (n === 1) {
    const cx = width / 2;
    return { positions: [{ ...nodes[0], x: cx, y: 76 }], width, height: 160, cx, cy: 76 };
  }
  if (n === 2) {
    const cx = width / 2;
    const offset = Math.min(150, width / 2 - 56);
    const cy = 92;
    return {
      positions: [
        { ...nodes[0], x: cx - offset, y: cy },
        { ...nodes[1], x: cx + offset, y: cy },
      ],
      width,
      height: 176,
      cx,
      cy,
    };
  }

  // Radius grows with node count but is capped by available width so labels
  // never run off the edge of a narrow card; height (not radius) absorbs the
  // extra room a bigger ring needs.
  const radius = Math.min(width / 2 - 68, 58 + n * 5);
  const cx = width / 2;
  const cy = radius + 66;
  const height = Math.round(radius * 2 + 132);
  const positions = nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { ...node, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  return { positions, width, height, cx, cy };
}

/**
 * Peer mesh — Headscale is a coordination plane, not a traffic hub.
 * Lines are node-to-node. The empty center is the overlay, not a router.
 */
export default function NetworkTopology({ nodes }: { nodes: TopoNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(420);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && Math.abs(w - width) > 2) setWidth(Math.round(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { positions: layout, height: H, cx: CX, cy: CY } = useMemo(
    () => layoutNodes(nodes, width),
    [nodes, width]
  );
  if (nodes.length === 0) return null;

  const links: { a: number; b: number }[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) links.push({ a: i, b: j });
  }
  // A dense full mesh (many nodes → many edges) reads as noise if every line
  // pulses at full strength — dial opacity/animation down as edges pile up
  // instead of letting them blur into a solid blob.
  const busy = links.length > 8;

  const onlineCount = nodes.filter(n => n.online).length;

  return (
    <div
      ref={containerRef}
      className="animate-fade-in"
      style={{
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-1)',
        background: 'var(--surface-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
        <div>
          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Live mesh</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>Peer links · traffic does not hairpin through LavaMesh</p>
        </div>
        {/* Fleet-health ring above already owns the online ratio — this badge just
            signals the map is live (or flags offline peers), never repeats "N/N online". */}
        {onlineCount === nodes.length ? (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
            style={{ color: 'var(--green)', background: 'var(--green-soft)' }}
          >
            <span className="status-dot online" />
            Live
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 whitespace-nowrap"
            style={{ color: 'var(--amber)', background: 'var(--amber-soft)' }}
          >
            {nodes.length - onlineCount} offline
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        <defs>
          <filter id="glow-green" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {links.map(({ a, b }, i) => {
          const from = layout[a], to = layout[b];
          const live = from.online && to.online;
          // Bow each edge outward, away from the ring's center, instead of
          // drawing a straight chord. Straight full-mesh chords all converge
          // near the middle and blur into a solid blob once there are more
          // than a handful of nodes; an outward bow keeps every real
          // connection visible without them stacking on top of each other.
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const dx = mx - CX, dy = my - CY;
          const dist = Math.hypot(dx, dy) || 1;
          const bow = links.length > 3 ? Math.min(28, 8 + links.length * 0.6) : 0;
          const ctrlX = mx + (dx / dist) * bow;
          const ctrlY = my + (dy / dist) * bow;
          return (
            <path
              key={`l-${i}`}
              d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
              fill="none"
              stroke={live ? '#ff7300' : 'rgba(255,255,255,0.12)'}
              strokeWidth={live ? (busy ? 1.4 : 2) : 1}
              strokeOpacity={live ? (busy ? 0.4 : 0.55) : 0.28}
              strokeLinecap="round"
            >
              {live && !busy && (
                <animate attributeName="stroke-opacity" values="0.35;0.75;0.35" dur="2.8s" repeatCount="indefinite" />
              )}
            </path>
          );
        })}

        {layout.map(node => (
          <g key={node.id}>
            {node.online && (
              <circle cx={node.x} cy={node.y} r={16} fill="none" stroke="rgba(61,220,132,0.25)" strokeWidth={1}>
                <animate attributeName="r" values="12;18;12" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.35;0.05;0.35" dur="2.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={node.x} cy={node.y} r={8}
              fill={node.online ? '#3ddc84' : 'rgba(255,255,255,0.12)'}
              stroke={node.online ? 'rgba(61,220,132,0.5)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={2}
              filter={node.online ? 'url(#glow-green)' : undefined}
            />
            <text
              x={node.x}
              y={node.y + 24}
              textAnchor="middle"
              fill={node.online ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.35)'}
              fontSize="11"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
            >
              {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
            </text>
            {node.ip && (
              <text
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                fill="rgba(255,255,255,0.32)"
                fontSize="9"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {node.ip}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
