'use client';
import { useEffect, useRef } from 'react';

const NODES = [
  { id: 'A', x: 480, y: 110, label: 'drews-macbook', type: 'mac', online: true },
  { id: 'B', x: 260, y: 55, label: 'london-vps', type: 'linux', online: true },
  { id: 'C', x: 680, y: 200, label: 'raspberry-pi', type: 'linux', online: true },
  { id: 'D', x: 90,  y: 220, label: 'office-pc', type: 'linux', online: true },
  { id: 'E', x: 400, y: 230, label: 'exit-node', type: 'exit', online: true },
  { id: 'F', x: 600, y: 350, label: 'staging', type: 'linux', online: false },
  { id: 'G', x: 220, y: 320, label: 'home-nas', type: 'linux', online: true },
  { id: 'H', x: 500, y: 420, label: 'iphone', type: 'mac', online: true },
];

const EDGES = [
  ['A','E'], ['B','E'], ['C','E'], ['D','E'],
  ['E','F'], ['E','G'], ['E','H'],
  ['A','B'], ['C','F'], ['D','G'], ['G','H'],
];

export default function HeroAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 780 480"
      className="w-full h-full"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Glows */}
        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-soft" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Animated gradient line */}
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,115,0,0)" />
          <stop offset="50%" stopColor="rgba(255,115,0,0.6)" />
          <stop offset="100%" stopColor="rgba(255,115,0,0)" />
        </linearGradient>
        {/* Packet animation */}
        <style>{`
          @keyframes dash-flow {
            from { stroke-dashoffset: 200; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes node-pulse {
            0%, 100% { r: 4; opacity: 0.6; }
            50%       { r: 7; opacity: 0.1; }
          }
          @keyframes packet {
            0%   { offset-distance: 0%;   opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { offset-distance: 100%; opacity: 0; }
          }
          @keyframes float-a {
            0%,100% { transform: translate(0,0); }
            50%     { transform: translate(3px,-4px); }
          }
          @keyframes float-b {
            0%,100% { transform: translate(0,0); }
            50%     { transform: translate(-4px,3px); }
          }
          @keyframes float-c {
            0%,100% { transform: translate(0,0); }
            50%     { transform: translate(2px,5px); }
          }
          @keyframes fade-in-svg {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .svg-enter { animation: fade-in-svg 1.2s ease both; }
        `}</style>
      </defs>

      {/* Background radial glow behind exit node */}
      <circle cx="400" cy="230" r="120" fill="rgba(255,115,0,0.04)" className="svg-enter" style={{ animationDelay: '0.5s' }} />
      <circle cx="400" cy="230" r="70" fill="rgba(255,115,0,0.06)" className="svg-enter" style={{ animationDelay: '0.7s' }} />

      {/* Edges */}
      {EDGES.map(([aId, bId], i) => {
        const a = NODES.find(n => n.id === aId)!;
        const b = NODES.find(n => n.id === bId)!;
        const isExitEdge = aId === 'E' || bId === 'E';
        const delay = i * 0.15;
        return (
          <g key={`${aId}-${bId}`} className="svg-enter" style={{ animationDelay: `${0.3 + delay}s` }}>
            {/* Base line */}
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isExitEdge ? 'rgba(255,115,0,0.12)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={isExitEdge ? 1.5 : 1}
            />
            {/* Animated dashed overlay */}
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isExitEdge ? 'rgba(255,115,0,0.35)' : 'rgba(255,255,255,0.12)'}
              strokeWidth={isExitEdge ? 1.5 : 1}
              strokeDasharray="20 180"
              style={{
                animation: `dash-flow ${2.5 + (i % 3) * 0.5}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map((node, i) => {
        const isExit = node.type === 'exit';
        const floatAnim = ['float-a','float-b','float-c'][i % 3];
        const r = isExit ? 10 : 6;
        const color = !node.online ? 'rgba(255,255,255,0.2)' : isExit ? '#ff7300' : '#3ddc84';
        const glowId = isExit ? 'glow-orange' : 'glow-green';

        return (
          <g
            key={node.id}
            className="svg-enter"
            style={{
              animationDelay: `${0.2 + i * 0.1}s`,
              animation: `fade-in-svg 0.8s ease ${0.2 + i * 0.1}s both, ${floatAnim} ${4 + (i % 3)}s ease-in-out ${i * 0.6}s infinite`,
              transformOrigin: `${node.x}px ${node.y}px`,
            }}
          >
            {/* Pulse ring (online nodes only) */}
            {node.online && (
              <circle
                cx={node.x} cy={node.y}
                fill="none"
                stroke={isExit ? 'rgba(255,115,0,0.2)' : 'rgba(61,220,132,0.2)'}
                strokeWidth="1"
                style={{
                  animation: `node-pulse ${2 + (i % 2)}s ease-in-out ${i * 0.4}s infinite`,
                }}
                r={r + 4}
              />
            )}
            {/* Node circle */}
            <circle
              cx={node.x} cy={node.y} r={r}
              fill={isExit ? '#ff7300' : node.online ? 'rgba(61,220,132,0.9)' : 'rgba(255,255,255,0.15)'}
              filter={node.online ? `url(#${glowId})` : undefined}
            />
            {/* Inner dot */}
            {!isExit && <circle cx={node.x} cy={node.y} r={2} fill="rgba(0,0,0,0.5)" />}
            {/* Exit node inner */}
            {isExit && <circle cx={node.x} cy={node.y} r={4} fill="rgba(255,255,255,0.3)" />}

            {/* Label */}
            <text
              x={node.x}
              y={node.y + r + 14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="0.03em"
            >
              {node.label}
            </text>
            {/* Exit node badge */}
            {isExit && (
              <text
                x={node.x}
                y={node.y - r - 8}
                textAnchor="middle"
                fill="rgba(255,115,0,0.7)"
                fontSize="8"
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
                letterSpacing="0.08em"
              >
                EXIT NODE
              </text>
            )}
          </g>
        );
      })}

      {/* Floating IP labels on a couple nodes */}
      {[
        { x: 480, y: 110, ip: '100.64.0.1' },
        { x: 260, y: 55,  ip: '100.64.0.3' },
      ].map(({ x, y, ip }) => (
        <g key={ip} className="svg-enter" style={{ animationDelay: '1.2s' }}>
          <rect x={x + 14} y={y - 9} width={64} height={15} rx={4} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
          <text x={x + 46} y={y + 1} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7.5" fontFamily="'JetBrains Mono', monospace">{ip}</text>
        </g>
      ))}
    </svg>
  );
}
