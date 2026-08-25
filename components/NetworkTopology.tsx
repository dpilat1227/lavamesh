'use client';
import { useMemo } from 'react';

interface TopoNode {
  id: string;
  name: string;
  online: boolean;
  user?: string;
  ip?: string;
}

export default function NetworkTopology({ nodes }: { nodes: TopoNode[] }) {
  const layout = useMemo(() => {
    if (nodes.length === 0) return [];
    const cx = 200, cy = 100;
    const radius = Math.min(75, 35 + nodes.length * 12);
    return nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [nodes]);

  if (nodes.length === 0) return null;

  // Generate connections between all nodes
  const connections: { from: number; to: number }[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      connections.push({ from: i, to: j });
    }
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>Network Topology</span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{nodes.filter(n => n.online).length}/{nodes.length} online</span>
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <svg
          viewBox="0 0 400 200"
          width="100%"
          style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <filter id="glow-green" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-orange" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,90,0,0.3)" />
            <stop offset="50%" stopColor="rgba(255,90,0,0.1)" />
            <stop offset="100%" stopColor="rgba(255,90,0,0.3)" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {/* Hub-spoke lines — each node connects to center hub */}
        {layout.map((node, i) => (
          <line
            key={`hub-${i}`}
            x1={node.x} y1={node.y} x2={300} y2={120}
            stroke={node.online ? 'url(#line-gradient)' : 'rgba(255,255,255,0.04)'}
            strokeWidth={node.online ? 1.5 : 0.5}
            strokeDasharray={node.online ? 'none' : '4 6'}
          >
            {node.online && (
              <animate
                attributeName="stroke-opacity"
                values="0.9;0.4;0.9"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </line>
        ))}

        {/* Peer-to-peer connections (dimmer) */}
        {connections.map(({ from, to }, i) => {
          const a = layout[from], b = layout[to];
          const bothOnline = a.online && b.online;
          return (
            <line
              key={`peer-${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={bothOnline ? 'rgba(255,90,0,0.08)' : 'rgba(255,255,255,0.02)'}
              strokeWidth={0.5}
              strokeDasharray="3 6"
            />
          );
        })}

        {/* Center mesh hub */}
        <circle cx={300} cy={120} r={16} fill="rgba(255,90,0,0.04)" stroke="rgba(255,90,0,0.12)" strokeWidth={1}>
          <animate attributeName="r" values="14;18;14" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx={300} cy={120} r={4} fill="rgba(255,90,0,0.6)" filter="url(#glow-orange)">
          <animate attributeName="r" values="3;5;3" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x={300} y={148} textAnchor="middle" fill="rgba(255,90,0,0.4)" fontSize="9" fontWeight="600" fontFamily="Inter, system-ui, sans-serif" letterSpacing="0.12em">
          MESH HUB
        </text>

        {/* Nodes */}
        {layout.map((node) => (
          <g key={node.id}>
            {/* Outer glow ring for online */}
            {node.online && (
              <circle cx={node.x} cy={node.y} r={14} fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth={1}>
                <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.15;0.03;0.15" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Node circle */}
            <circle
              cx={node.x} cy={node.y} r={8}
              fill={node.online ? '#34d399' : 'rgba(255,255,255,0.1)'}
              stroke={node.online ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={2}
              filter={node.online ? 'url(#glow-green)' : undefined}
            />
            {/* Hostname label */}
            <text
              x={node.x}
              y={node.y + 24}
              textAnchor="middle"
              fill={node.online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'}
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
            >
              {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
            </text>
            {/* IP label */}
            {node.ip && (
              <text
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                fill="rgba(255,255,255,0.25)"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {node.ip}
              </text>
            )}
          </g>
        ))}
      </svg>
      </div>
    </div>
  );
}
