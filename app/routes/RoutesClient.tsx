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
      className="animate-fade-in grid items-center px-5 py-3.5 table-row-hover"
      style={{
        gridTemplateColumns: '1fr 160px 110px 100px',
        borderBottom: '1px solid var(--border-1)',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Prefix */}
      <div className="flex items-center gap-2.5 min-w-0">
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

      {/* Advertised by */}
      <div className="min-w-0">
        <p className="text-[13px] truncate" style={{ color: 'var(--text-2)' }}>{name}</p>
        {ip && <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{ip}</p>}
      </div>

      {/* Status */}
      <div>
        {optimisticEnabled ? (
          <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Approved</span>
        ) : (
          <span className="badge badge-amber">Pending</span>
        )}
      </div>

      {/* Action */}
      <div className="flex justify-end">
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
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Subnet Routing</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
            {approved} approved · {pending > 0 ? <span style={{ color: 'var(--amber)' }}>{pending} pending</span> : '0 pending'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-ghost">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)' }}></span>
            {exits.filter(r => r.enabled).length}/{exits.length} Exit Nodes
          </div>
          <div className="badge badge-ghost">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }}></span>
            {subnets.filter(r => r.enabled).length}/{subnets.length} Subnets
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5" style={{ minHeight: 0 }}>
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
                <div className="card overflow-hidden">
                  <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '1fr 160px 110px 100px', borderBottom: '1px solid var(--border-1)' }}>
                    {['Prefix', 'Advertised By', 'Status', ''].map(h => (
                      <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
                    ))}
                  </div>
                  {exits.map((r, i) => <RouteRow key={r.id} route={r} index={i} />)}
                </div>
              </section>
            )}

            {/* Subnet routes section */}
            {subnets.length > 0 && (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--text-4)' }}>Subnet Routes</p>
                <div className="card overflow-hidden">
                  <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '1fr 160px 110px 100px', borderBottom: '1px solid var(--border-1)' }}>
                    {['Prefix', 'Advertised By', 'Status', ''].map(h => (
                      <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
                    ))}
                  </div>
                  {subnets.map((r, i) => <RouteRow key={r.id} route={r} index={i} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
