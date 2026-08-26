'use client';
import { useTransition, useOptimistic } from 'react';
import { enableRoute, disableRoute } from '@/app/actions';
import { Badge, PageHeader, StatsHero, SplitView, ContextSection, UpsellCard, InsightCard } from '@/components/ui';

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

function RouteRow({ route, index, haRole }: { route: Route; index: number; haRole?: 'primary' | 'backup' }) {
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

  const icon = (
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
  );
  const statusBadge = optimisticEnabled ? (
    <Badge variant="green" dot pulse>Approved</Badge>
  ) : (
    <Badge variant="amber">Pending</Badge>
  );
  const actionBtn = (
    <button
      onClick={toggle}
      disabled={isPending}
      className="btn text-[12px] px-3 py-1.5"
      style={{
        background: optimisticEnabled ? 'var(--red-soft)' : 'var(--green-soft)',
        color: optimisticEnabled ? 'var(--red)' : 'var(--green)',
        border: `1px solid ${optimisticEnabled ? 'rgba(248,113,113,0.2)' : 'rgba(61,220,132,0.2)'}`,
        opacity: isPending ? 0.6 : 1,
        borderRadius: '8px',
      }}
    >
      {isPending ? '…' : optimisticEnabled ? 'Disable' : 'Approve'}
    </button>
  );

  return (
    <div
      className="animate-fade-in table-row-hover row-alt"
      style={{
        borderBottom: '1px solid var(--border-1)',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Desktop / tablet */}
      <div className="route-row-desktop flex items-center justify-between px-1 py-3.5">
        {/* Left: Prefix */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
          {icon}
          <div>
            <code className="text-[13px]" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{route.prefix}</code>
            {exit && <Badge variant="purple" className="ml-2 text-[10px]">Exit Node</Badge>}
          </div>
        </div>

        {/* Right: Packed Metadata */}
        <div className="flex items-center flex-shrink-0">
          <div className="w-[180px] min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] truncate" style={{ color: 'var(--text-2)' }}>{name}</p>
              {haRole && (
                <Badge variant={haRole === 'primary' ? 'green' : 'ghost'} className="text-[9px] flex-shrink-0">
                  {haRole === 'primary' ? 'Primary' : 'Backup'}
                </Badge>
              )}
            </div>
            {ip && <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{ip}</p>}
          </div>

          <div className="w-[110px]">{statusBadge}</div>
          <div className="w-[110px] flex justify-end">{actionBtn}</div>
        </div>
      </div>

      {/* Mobile: stacked card */}
      <div className="route-row-mobile" style={{ display: 'none', padding: '12px 4px' }}>
        <div className="flex items-center gap-2.5 mb-2">
          {icon}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <code className="text-[13px]" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{route.prefix}</code>
              {exit && <Badge variant="purple" className="text-[10px]">Exit Node</Badge>}
              {haRole && (
                <Badge variant={haRole === 'primary' ? 'green' : 'ghost'} className="text-[9px]">
                  {haRole === 'primary' ? 'Primary' : 'Backup'}
                </Badge>
              )}
            </div>
          </div>
          {statusBadge}
        </div>
        <div className="flex items-center justify-between gap-3 pl-[38px]">
          <div className="min-w-0">
            <p className="text-[12.5px] truncate" style={{ color: 'var(--text-2)' }}>{name}</p>
            {ip && <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{ip}</p>}
          </div>
          {actionBtn}
        </div>
      </div>
    </div>
  );
}

interface SubnetGroup {
  prefix: string;
  routes: Route[];
  isHA: boolean;
}

export default function RoutesClient({ routes }: { routes: Route[] }) {
  const exits = routes.filter(isExitNode);
  const subnets = routes.filter(r => !isExitNode(r));
  const pendingRoutes = routes.filter(r => r.advertised && !r.enabled);
  const pending = pendingRoutes.length;
  const approved = routes.filter(r => r.enabled).length;

  const byPrefix = new Map<string, Route[]>();
  for (const r of subnets) {
    if (!byPrefix.has(r.prefix)) byPrefix.set(r.prefix, []);
    byPrefix.get(r.prefix)!.push(r);
  }
  const subnetGroups: SubnetGroup[] = [...byPrefix.entries()].map(([prefix, group]) => ({ prefix, routes: group, isHA: group.length > 1 }));
  const haGroupCount = subnetGroups.filter(g => g.isHA).length;

  const table = (
    <div className="flex-1 flex flex-col min-h-0 relative space-y-5 overflow-y-auto pr-4 custom-scrollbar pb-8">
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
          {exits.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--text-4)' }}>Exit Nodes</p>
              <div className="route-row-desktop flex-shrink-0 flex items-center justify-between px-1 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
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

          {subnets.length > 0 && (
            <section className={exits.length > 0 ? 'mt-6' : ''}>
              <div className="flex items-center gap-2 px-1 mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Subnet Routes</p>
                {haGroupCount > 0 && (
                  <Badge variant="green" className="text-[9px]">{haGroupCount} HA group{haGroupCount > 1 ? 's' : ''}</Badge>
                )}
              </div>
              <div className="route-row-desktop flex-shrink-0 flex items-center justify-between px-1 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>Prefix</span>
                <div className="flex items-center flex-shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider w-[180px]" style={{ color: 'var(--text-3)' }}>Advertised By</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px]" style={{ color: 'var(--text-3)' }}>Status</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider w-[110px] text-right" style={{ color: 'var(--text-3)' }}>Action</span>
                </div>
              </div>
              {subnetGroups.map(group =>
                group.isHA ? (
                  <div key={group.prefix} className="mt-2 rounded-[10px] px-1 py-1" style={{ background: 'rgba(61,220,132,0.03)', border: '1px solid rgba(61,220,132,0.14)' }}>
                    <div className="flex items-center gap-2 px-2 pt-1.5 pb-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--green)' }}>Automatic failover — {group.routes.length} nodes advertising this subnet</span>
                    </div>
                    {group.routes.map((r, i) => <RouteRow key={r.id} route={r} index={i} haRole={r.isPrimary ? 'primary' : 'backup'} />)}
                  </div>
                ) : (
                  group.routes.map((r, i) => <RouteRow key={r.id} route={r} index={i} />)
                )
              )}
            </section>
          )}
        </>
      )}
    </div>
  );

  const pane = (
    <>
      <InsightCard
        title="Needs Attention"
        accent="rgba(245,158,11,0.15)"
        emptyLabel="All advertised routes are approved. Nothing waiting on you."
        items={pendingRoutes.map(r => ({
          label: `${r.prefix} · ${(r.machine || r.node)?.givenName || 'unknown'}`,
          value: 'Pending',
          tone: 'amber',
        }))}
      />
      <ContextSection
        title="How Routing Works"
        collapsible
        items={[
          { title: 'Exit Nodes', desc: 'Route all traffic through a node to use its IP address and location. Useful for accessing geo-restricted services.', icon: '🌐', color: '#ff7300' },
          { title: 'Subnet Routes', desc: 'Expose an entire subnet (like 192.168.1.0/24) to your mesh. Other nodes can access devices on that LAN.', icon: '🔗', color: '#8B5CF6' },
          { title: 'Advertising a Route', desc: 'Run tailscale up --advertise-routes=192.168.1.0/24 on any node, then approve it here.', icon: '📡', color: '#3ddc84' },
          { title: 'High Availability, free', desc: 'Advertise the same subnet from a second node and approve both — Headscale automatically marks one Primary and fails over to the other if it drops. No extra config, any plan.', icon: '🔁', color: '#3ddc84' },
        ]}
      />
      <UpsellCard
        eyebrow="Pro Feature"
        title="Failover Alerts"
        description="Get an email or webhook the moment a subnet route fails over to its backup node — configure it in Settings on Pro or Cloud."
        href="/settings"
        ctaLabel="Open notification settings"
        icon={
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
          </svg>
        }
      />
    </>
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader
        title="Subnet Routing"
        subtitle={<>{approved} approved · {pending > 0 ? <span style={{ color: 'var(--amber)' }}>{pending} pending</span> : '0 pending'}</>}
      />

      {/* Same main-stat panel pattern as Dashboard: the ring owns the one true
          ratio (approved/total) so it isn't repeated as text elsewhere on the page. */}
      <div className="px-8 pt-1 pb-4 flex-shrink-0">
        <StatsHero
          ring={{ value: approved, total: routes.length, label: 'approved' }}
          metrics={[
            { label: 'Exit nodes', value: `${exits.filter(r => r.enabled).length}/${exits.length}` },
            { label: 'Subnets', value: `${subnets.filter(r => r.enabled).length}/${subnets.length}` },
            { label: 'Total routes', value: routes.length },
          ]}
        />
      </div>

      <SplitView
        columns={3}
        main={table}
        pane={pane}
      />
    </div>
  );
}
