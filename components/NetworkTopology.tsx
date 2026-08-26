'use client';
import { useMemo } from 'react';

interface TopoNode {
  id: string;
  name: string;
  online: boolean;
  user?: string;
  ip?: string;
}

const W = 560;
const H = 220;
const CX = W / 2;
const CY = H / 2 - 8;

function layoutNodes(nodes: TopoNode[]) {
  const n = nodes.length;
  if (n === 0) return [];
  // Two peers sit left/right so the link is a real horizontal line, not a
  // collapsed vertical stroke (SVG gradients vanish on zero-width bboxes).
  if (n === 1) {
    return [{ ...nodes[0], x: CX, y: CY - 24 }];
  }
  if (n === 2) {
    return [
      { ...nodes[0], x: CX - 150, y: CY },
      { ...nodes[1], x: CX + 150, y: CY },
    ];
  }
  const radius = Math.min(88, 48 + n * 6);
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { ...node, x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
  });
}

/**
 * Peer mesh — Headscale is a coordination plane, not a traffic hub.
 * Lines are node-to-node. The empty center is the overlay, not a router.
 */
export default function NetworkTopology({ nodes }: { nodes: TopoNode[] }) {
  const layout = useMemo(() => layoutNodes(nodes), [nodes]);
  if (nodes.length === 0) return null;

  const links: { a: number; b: number }[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) links.push({ a: i, b: j });
  }

  const onlineCount = nodes.filter(n => n.online).length;

  return (
    <div
      className="animate-fade-in"
      style={{ width: '100%', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <div>
          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Live mesh</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>Peer links · traffic does not hairpin through LavaMesh</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{ color: 'var(--green)', background: 'var(--green-soft)' }}
        >
          <span className="status-dot online" />
          {onlineCount}/{nodes.length} online
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <filter id="glow-green" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {links.map(({ a, b }, i) => {
          const from = layout[a], to = layout[b];
          const live = from.online && to.online;
          return (
            <line
              key={`l-${i}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={live ? '#FF5A00' : 'rgba(255,255,255,0.12)'}
              strokeWidth={live ? 2 : 1}
              strokeOpacity={live ? 0.55 : 0.35}
              strokeLinecap="round"
            >
              {live && (
                <animate attributeName="stroke-opacity" values="0.35;0.75;0.35" dur="2.8s" repeatCount="indefinite" />
              )}
            </line>
          );
        })}

        {layout.map(node => (
          <g key={node.id}>
            {node.online && (
              <circle cx={node.x} cy={node.y} r={16} fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth={1}>
                <animate attributeName="r" values="12;18;12" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.35;0.05;0.35" dur="2.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={node.x} cy={node.y} r={8}
              fill={node.online ? '#34d399' : 'rgba(255,255,255,0.12)'}
              stroke={node.online ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.15)'}
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
