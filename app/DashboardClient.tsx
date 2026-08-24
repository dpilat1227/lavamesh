'use client';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { generatePreAuthKey, revokeNode } from '@/app/actions';

// ── OS detection ──────────────────────────────────────────────────────────────
function OsIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('mac') || n.includes('darwin') || n.includes('iphone') || n.includes('ipad')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-3)' }}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    );
  }
  if (n.includes('ubuntu') || n.includes('linux') || n.includes('debian') || n.includes('fedora') || n.includes('server')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-3)' }}>
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00.11.135 9.647 9.647 0 003.516-.434c.016-.007.016-.027 0-.04a.5.5 0 00-.165-.047c-.439-.077-.866-.198-1.275-.355.02-.035.058-.077.116-.12.3-.223.718-.4 1.262-.444.538-.043 1.131.056 1.728.39.598.338 1.177.93 1.657 1.814.48.88.872 2.036.98 3.486.27 3.576 1.09 5.54 2.596 6.333.35.185.704.292 1.04.364a.378.378 0 00.33-.074 9.47 9.47 0 002.54-2.777.384.384 0 00-.08-.393 9.81 9.81 0 00-1.04-.904c-.029-.021-.016-.07.02-.075a.51.51 0 01.152.013c.424.098.82.283 1.18.555.363.273.694.62.978 1.034.283.413.513.89.659 1.427.145.537.2 1.13.134 1.761a.38.38 0 00.216.362c.25.093.508.17.773.234.265.065.535.117.81.156a.383.383 0 00.41-.237 9.453 9.453 0 001.02-3.28.38.38 0 00-.193-.38 9.684 9.684 0 00-1.397-.623c-.028-.011-.025-.062.005-.068a.49.49 0 01.154.002c.455.048.886.17 1.28.363.393.19.744.458 1.03.793.286.334.507.732.64 1.185.134.454.175.966.099 1.52a.38.38 0 00.263.41c.247.061.5.108.76.139.26.032.525.05.793.055a.38.38 0 00.373-.33 9.56 9.56 0 00-.043-2.26.38.38 0 00-.356-.314 9.728 9.728 0 00-1.498.044c-.03.004-.043-.044-.017-.057a.474.474 0 01.148-.047c.465-.067.924-.07 1.368-.012.443.059.87.188 1.261.384.39.196.74.462 1.028.79.288.328.512.72.651 1.164.14.443.19.944.127 1.49-.26.023-.523.03-.788.022a.38.38 0 00-.387.308 9.506 9.506 0 01-1.165 3.013.38.38 0 00.083.48c.21.17.432.326.665.467.233.14.476.266.73.376.255.11.518.204.793.28a.38.38 0 00.447-.208 9.63 9.63 0 001.007-3.355.383.383 0 00-.215-.381 9.753 9.753 0 00-1.413-.578c-.028-.009-.027-.06.002-.067a.496.496 0 01.155 0c.462.044.903.16 1.31.345.407.185.774.44 1.08.755.306.315.549.693.706 1.12.156.426.223.908.18 1.434a9.585 9.585 0 01-.04.406.38.38 0 00.286.408c.252.055.51.094.772.118.263.024.53.031.8.023a.38.38 0 00.363-.306 9.53 9.53 0 00-.023-3.32"/>
      </svg>
    );
  }
  // Default server
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  );
}

// ── Token modal ────────────────────────────────────────────────────────────────
function TokenModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [copied, setCopied] = useState<'key' | 'cmd' | null>(null);
  const cmd = `curl -fsSL "https://www.lavamesh.com/api/install.sh?token=${token}" | sudo sh`;

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const copy = async (text: string, which: 'key' | 'cmd') => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-fade-in-up w-full max-w-lg glass-strong rounded-[20px] p-6 space-y-5"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(255,90,0,0.08)' }}>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#FF5A00' }}></div>
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>Provision Token Ready</h2>
            </div>
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>Single-use · Expires in 30 days · Shown once</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-1.5 rounded-[8px]" style={{ border: 'none', color: 'var(--text-3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Auth key */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Auth Key</p>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
            <code className="flex-1 text-[12px] font-mono truncate" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{token}</code>
            <button onClick={() => copy(token, 'key')} className="btn btn-ghost text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0">
              {copied === 'key' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Install command */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Install Command</p>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)' }}>
            <pre className="flex-1 text-[11.5px] whitespace-pre-wrap break-all leading-relaxed" style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{cmd}</pre>
            <button onClick={() => copy(cmd, 'cmd')} className="btn btn-ghost text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0 mt-0.5">
              {copied === 'cmd' ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-ghost w-full justify-center" style={{ borderColor: 'var(--border-2)' }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Node detail panel ─────────────────────────────────────────────────────────
function NodePanel({ node, onClose, onRevoke }: { node: any; onClose: () => void; onRevoke: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="animate-slide-in-right w-[320px] flex-shrink-0 flex flex-col" style={{ borderLeft: '1px solid var(--border-1)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{node.givenName}</h3>
        <button onClick={onClose} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status */}
        <div className="flex items-center gap-2.5 p-3 rounded-[12px]" style={{ background: node.online ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${node.online ? 'rgba(52,211,153,0.15)' : 'var(--border-1)'}` }}>
          <span className={`status-dot ${node.online ? 'online' : 'offline'}`}></span>
          <span className="text-[13px] font-medium" style={{ color: node.online ? 'var(--green)' : 'var(--text-3)' }}>{node.online ? 'Online' : 'Offline'}</span>
        </div>

        {/* Details */}
        {[
          { label: 'Node ID', value: node.id },
          { label: 'Hostname', value: node.name || node.givenName },
          { label: 'Mesh IP', value: node.ipAddresses?.[1] || node.ipAddresses?.[0], mono: true },
          { label: 'IPv6', value: node.ipAddresses?.find((ip: string) => ip.includes(':')) || '—', mono: true },
          { label: 'User', value: node.user?.name || '—' },
          { label: 'Last Seen', value: node.lastSeen && node.lastSeen !== '0001-01-01T00:00:00Z' ? new Date(node.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never' },
          { label: 'Created', value: node.createdAt ? new Date(node.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
          { label: 'Expiry', value: node.expiry && !node.expiry.startsWith('0001') ? new Date(node.expiry).toLocaleDateString() : 'Never' },
        ].map(({ label, value, mono }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>{label}</p>
            <p className="text-[13px] break-all" style={{ color: 'var(--text-2)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revoke */}
      <div className="p-5" style={{ borderTop: '1px solid var(--border-1)' }}>
        {confirming ? (
          <div className="space-y-2">
            <p className="text-[12px] text-center" style={{ color: 'var(--text-3)' }}>Remove <span style={{ color: 'var(--text-1)' }}>{node.givenName}</span> from the mesh?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="btn btn-ghost flex-1 justify-center text-[12px]">Cancel</button>
              <button onClick={onRevoke} className="btn btn-danger flex-1 justify-center text-[12px]">Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="btn btn-danger w-full justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Revoke Node
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, delay = 0 }: {
  label: string; value: number | string; sub?: string; accent?: string; delay?: number;
}) {
  return (
    <div className="animate-fade-in-up card p-5 relative overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      {accent && <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />}
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)' }}>{label}</p>
      <div className="animate-counter" style={{ animationDelay: `${delay + 100}ms` }}>
        <span className="text-[32px] font-bold tracking-tight leading-none" style={{ color: accent || 'var(--text-1)' }}>{value}</span>
      </div>
      {sub && <p className="text-[11px] mt-2" style={{ color: 'var(--text-4)' }}>{sub}</p>}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DashboardClient({ nodes }: { nodes: any[] }) {
  const [token, setToken] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [lastRefresh] = useState(new Date());

  const visibleNodes = nodes.filter(n => !removedIds.has(n.id));
  const online = visibleNodes.filter(n => n.online).length;
  const offline = visibleNodes.length - online;

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const key = await generatePreAuthKey();
      setToken(key);
    } catch {}
    setGenerating(false);
  }, []);

  const handleRevoke = useCallback(async (id: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    setSelectedNode(null);
    try { await revokeNode(id); } catch { setRemovedIds(prev => { const s = new Set(prev); s.delete(id); return s; }); }
  }, []);

  const formatDate = (d: string) => {
    if (!d || d.startsWith('0001')) return 'Never';
    const date = new Date(d);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {token && <TokenModal token={token} onClose={() => setToken(null)} />}

      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Node Fleet</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn btn-primary"
        >
          {generating ? (
            <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Provision Token</>
          )}
        </button>
      </header>

      {/* Stats row */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 grid grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={visibleNodes.length} sub="in fleet" delay={0} />
        <StatCard label="Online" value={online} sub="active now" accent="var(--green)" delay={60} />
        <StatCard label="Offline" value={offline} sub="unreachable" accent={offline > 0 ? 'var(--red)' : 'var(--text-4)'} delay={120} />
        <StatCard label="Uptime" value="99.9%" sub="last 30 days" accent="var(--orange)" delay={180} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-5" style={{ minHeight: 0 }}>
        {/* Table */}
        <div className="flex-1 flex flex-col overflow-hidden card">
          {/* Table header */}
          <div className="flex-shrink-0 grid px-5 py-3" style={{ gridTemplateColumns: '1fr 140px 120px 90px 32px', borderBottom: '1px solid var(--border-1)' }}>
            {['Node', 'Mesh IP', 'Last Seen', 'Status', ''].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {visibleNodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-4)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
                <p className="text-[13px]">No nodes connected</p>
                <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Generate a provision token to add the first node</p>
              </div>
            ) : (
              visibleNodes.map((node, i) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  className="animate-fade-in grid items-center px-5 py-3.5 cursor-pointer table-row-hover"
                  style={{
                    gridTemplateColumns: '1fr 140px 120px 90px 32px',
                    borderBottom: '1px solid var(--border-1)',
                    animationDelay: `${i * 30}ms`,
                    background: selectedNode?.id === node.id ? 'rgba(255,90,0,0.04)' : undefined,
                    borderLeft: selectedNode?.id === node.id ? '2px solid var(--orange)' : '2px solid transparent',
                  }}
                >
                  {/* Name + icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
                      <OsIcon name={node.givenName} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-1)' }}>{node.givenName}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{node.user?.name || 'admin'}</p>
                    </div>
                  </div>
                  {/* IP */}
                  <span className="text-[12px] font-mono tabular-nums" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {node.ipAddresses?.[1] || node.ipAddresses?.[0] || '—'}
                  </span>
                  {/* Last seen */}
                  <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>{formatDate(node.lastSeen)}</span>
                  {/* Status */}
                  <div>
                    {node.online ? (
                      <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Online</span>
                    ) : (
                      <span className="badge badge-ghost"><span className="status-dot offline" style={{ width: 5, height: 5 }}></span>Offline</span>
                    )}
                  </div>
                  {/* Chevron */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: selectedNode?.id === node.id ? 'var(--orange)' : 'var(--text-4)', transition: 'transform 0.2s', transform: selectedNode?.id === node.id ? 'rotate(180deg)' : undefined }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Node detail panel */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onRevoke={() => handleRevoke(selectedNode.id)}
          />
        )}
      </div>
    </div>
  );
}
