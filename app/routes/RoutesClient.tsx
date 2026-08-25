'use client';
import { useTransition, useOptimistic, useState } from 'react';
import { enableRoute, disableRoute } from '@/app/actions';

interface Route {
  id: string;
  prefix: string;
  advertised: boolean;
  enabled: boolean;
  isPrimary: boolean;
  machine?: { id: string; givenName: string; ipAddresses: string[] };
  node?: { id: string; givenName: string; ipAddresses: string[] };
}

const isExitNode = (r: Route) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0';

function RouteRow({ route, index }: { route: Route; index: number }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(route.enabled);

  const machine = route.machine || route.node;
  const name = machine?.givenName || `Node ${machine?.id || '?'}`;
  const ip = machine?.ipAddresses?.[0] || '';
  const exit = isExitNode(route);

  const toggle = () => {
    startTransition(async () => {
      setOptimisticEnabled(!optimisticEnabled);
      if (optimisticEnabled) await disableRoute(route.id);
      else await enableRoute(route.id);
    });
  };

  return (
    <div
      className="animate-fade-in flex items-center justify-between px-1 py-3.5 table-row-hover row-alt"
      style={{
        borderBottom: '1px solid var(--border-1)',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Left: Prefix */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ background: exit ? 'var(--purple-soft)' : 'var(--surface-3)', border: `1px solid ${exit ? 'rgba(167,139,250,0.2)' : 'var(--border-2)'}` }}>
          {exit ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--purple)' }}>
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          )}
        </div>
        <div>
          <code className="text-[13px]" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{route.prefix}</code>
          {exit && <span className="ml-2 badge badge-purple text-[10px]">Exit Node</span>}
        </div>
      </div>

      {/* Right: Packed Metadata */}
      <div className="flex items-center flex-shrink-0">
        <div className="w-[180px] min-w-0 pr-2">
          <p className="text-[13px] truncate" style={{ color: 'var(--text-2)' }}>{name}</p>
          {ip && <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{ip}</p>}
        </div>
        
        <div className="w-[110px]">
          {optimisticEnabled ? (
            <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Approved</span>
          ) : (
            <span className="badge badge-amber">Pending</span>
          )}
        </div>

        <div className="w-[110px] flex justify-end">
          <button
            onClick={toggle}
            disabled={isPending}
            className="btn text-[12px] px-3 py-1.5"
            style={{
              background: optimisticEnabled ? 'var(--red-soft)' : 'var(--green-soft)',
              color: optimisticEnabled ? 'var(--red)' : 'var(--green)',
              border: `1px solid ${optimisticEnabled ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
              opacity: isPending ? 0.6 : 1,
              borderRadius: '8px',
            }}
          >
            {isPending ? '…' : optimisticEnabled ? 'Disable' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoutesClient({ routes }: { routes: Route[] }) {
  const exits = routes.filter(isExitNode);
  const subnets = routes.filter(r => !isExitNode(r));
  const pending = routes.filter(r => r.advertised && !r.enabled).length;
  const approved = routes.filter(r => r.enabled).length;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <header className="flex-shrink-0 px-8 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Subnet Routing</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
              {approved} approved · {pending > 0 ? <span style={{ color: 'var(--amber)' }}>{pending} pending</span> : '0 pending'}
            </p>
          </div>
        </div>
        {/* Stat cards — upgraded to Bento style */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'EXIT NODES', val: `${exits.filter(r => r.enabled).length}/${exits.length}`, color: 'var(--purple)', bg: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.02) 100%)', border: 'rgba(139,92,246,0.2)' },
            { label: 'SUBNETS', val: `${subnets.filter(r => r.enabled).length}/${subnets.length}`, color: 'var(--green)', bg: 'linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.02) 100%)', border: 'rgba(52,211,153,0.2)' },
            { label: 'TOTAL ROUTES', val: String(routes.length), color: 'var(--text-1)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
          ].map(s => (
            <div key={s.label} className="px-5 py-4 rounded-[12px] relative overflow-hidden" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[30px] opacity-20" style={{ background: s.color, transform: 'translate(30%, -30%)' }} />
              <div className="text-[10px] font-semibold mb-2 relative z-10" style={{ color: 'var(--text-3)', letterSpacing: '0.08em' }}>{s.label}</div>
              <div className="text-[28px] font-bold tracking-tight leading-none relative z-10" style={{ color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 grid grid-cols-[1fr_300px] gap-8" style={{ minHeight: 0 }}>
        {/* Left Column: Data Table */}
        <div className="flex flex-col min-h-0 relative space-y-5 overflow-y-auto pr-4 custom-scrollbar pb-8">
        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60%] gap-4" style={{ color: 'var(--text-4)' }}>
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-3)' }}>No routes advertised</p>
              <p className="text-[12px]">Connect a node with <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--orange)' }}>--advertise-routes</code> or <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>--advertise-exit-node</code></p>
            </div>
          </div>
        ) : (
          <>
            {/* Exit nodes section */}
            {exits.length > 0 && (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--text-4)' }}>Exit Nodes</p>
                <div className="flex-shrink-0 flex items-center justify-between px-1 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>Prefix</span>
                    <div className="flex items-center flex-shrink-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[180px]" style={{ color: 'var(--text-3)' }}>Advertised By</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px]" style={{ color: 'var(--text-3)' }}>Status</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px] text-right" style={{ color: 'var(--text-3)' }}>Action</span>
                    </div>
                  </div>
                  {exits.map((r, i) => <RouteRow key={r.id} route={r} index={i} />)}
              </section>
            )}

            {/* Subnet routes section */}
            {subnets.length > 0 && (
              <section className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--text-4)' }}>Subnet Routes</p>
                <div className="flex-shrink-0 flex items-center justify-between px-1 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>Prefix</span>
                    <div className="flex items-center flex-shrink-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[180px]" style={{ color: 'var(--text-3)' }}>Advertised By</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px]" style={{ color: 'var(--text-3)' }}>Status</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px] text-right" style={{ color: 'var(--text-3)' }}>Action</span>
                    </div>
                  </div>
                  {subnets.map((r, i) => <RouteRow key={r.id} route={r} index={i} />)}
              </section>
            )}
          </>
        )}

        </div>

        {/* Right Column: Context Pane */}
        <div className="flex flex-col gap-4 overflow-y-auto pb-8 pr-2 custom-scrollbar">
          <div className="rounded-[12px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)' }} />
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>How Routing Works</p>
              <div className="flex flex-col gap-6">
                {[
                  { title: 'Exit Nodes', desc: 'Route all traffic through a node to use its IP address and location. Useful for accessing geo-restricted services.', icon: '🌐', color: '#FF5A00' },
                  { title: 'Subnet Routes', desc: 'Expose an entire subnet (like 192.168.1.0/24) to your mesh. Other nodes can access devices on that LAN.', icon: '🔗', color: '#8B5CF6' },
                  { title: 'Advertising a Route', desc: 'Run tailscale up --advertise-routes=192.168.1.0/24 on any node, then approve it here.', icon: '📡', color: '#34D399' },
                ].map(item => (
                  <div key={item.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px]" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>{item.icon}</div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>{item.title}</p>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-[12px] overflow-hidden p-5 flex flex-col gap-3 relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <circle cx="12" cy="12" r="10" />
                 <path d="M12 8v4l3 3" />
               </svg>
             </div>
             <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--green)', letterSpacing: '0.08em' }}>Cloud Feature</p>
             <h3 className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>High Availability</h3>
             <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>LavaMesh Cloud automatically provisions redundant Headscale relays to ensure subnet routes never drop. Upgrade to Cloud.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
