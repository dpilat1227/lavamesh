'use client';

/**
 * Mobile stand-in for HeroAnimation. A force-mesh graph with 8 nodes and
 * criss-crossing lines reads great wide and open on desktop, but there's no
 * amount of resizing that makes small dots + 8px labels legible at ~340px —
 * it just looks like noise. A device list is the one thing UI mockups are
 * reliably good at on a phone: real-looking names, a status dot, one glance.
 * Same node names as HeroAnimation so the two feel like the same product.
 */
const NODES = [
  { name: 'drews-macbook', ip: '100.64.0.1', online: true },
  { name: 'london-vps', ip: '100.64.0.3', online: true },
  { name: 'raspberry-pi', ip: '100.64.0.5', online: true },
  { name: 'staging', ip: '100.64.0.7', online: false },
];

export default function HeroMobileProof() {
  const onlineCount = NODES.filter(n => n.online).length;

  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: '#0c0a08',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#3ddc84' }} />
          <span className="text-[13px] font-semibold" style={{ color: 'white' }}>Live mesh</span>
        </div>
        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {onlineCount}/{NODES.length} online
        </span>
      </div>
      <div>
        {NODES.map((node, i) => (
          <div
            key={node.name}
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: i < NODES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="rounded-full flex-shrink-0"
                style={{
                  width: 8,
                  height: 8,
                  background: node.online ? '#3ddc84' : 'rgba(255,255,255,0.2)',
                  boxShadow: node.online ? '0 0 8px rgba(61,220,132,0.6)' : 'none',
                }}
              />
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>{node.name}</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{node.ip}</div>
              </div>
            </div>
            <span
              className="text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0"
              style={{
                color: node.online ? '#3ddc84' : 'rgba(255,255,255,0.4)',
                background: node.online ? 'rgba(61,220,132,0.1)' : 'rgba(255,255,255,0.04)',
              }}
            >
              {node.online ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
