import type { ReactNode } from 'react';
import { getAuditLog } from '@/lib/audit';
import { kvConfigured } from '@/lib/kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPlanStatus } from '@/lib/billing';
import { Badge, Card, PageHeader, SplitView, ContextSection, ProShowcase } from '@/components/ui';
import AuditClient from './AuditClient';

const WHAT_GETS_LOGGED = [
  { title: 'Key Events', desc: 'Generation, revocation, and expiration of pre-auth keys', icon: '🔑', color: '#ff7300' },
  { title: 'Node Events', desc: 'Rename, expire, revoke, and tag changes', icon: '🖥️', color: '#60a5fa' },
  { title: 'Route Changes', desc: 'Subnet route failover when a backup node takes over', icon: '🔀', color: '#a78bfa' },
  { title: 'Policy & DNS', desc: 'ACL updates, extra DNS records, backups, and test alerts', icon: '👤', color: '#3ddc84' },
];

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const plan = await getPlanStatus((session?.user as any)?.id);
  const configured = kvConfigured();
  const events = plan.isPro && configured ? await getAuditLog(500) : [];

  let main: ReactNode;

  if (!plan.isPro) {
    main = (
      <div key="community" className="flex flex-col gap-5 pb-8">
        {/* Mockup preview — clearly labeled, shows what the log looks like when populated */}
        <Card padded={false} className="animate-fade-in-up relative">
          <div className="flex items-center gap-2 px-5 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
            <Badge variant="orange" className="text-[9px] uppercase tracking-wider">Upgrade to Unlock</Badge>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>Example data · not your real events</span>
          </div>
          <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
            {['Time', 'Action', 'Details'].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
            ))}
          </div>
          <div style={{ opacity: 0.85 }}>
            {[
              { time: '2 min ago', action: 'key.generated', detail: 'Pre-auth key created by admin1 · reusable', color: 'var(--green)' },
              { time: '15 min ago', action: 'node.expired', detail: 'macbook-air-m1 forced to reauthenticate', color: 'var(--amber)' },
              { time: '1 hr ago', action: 'dns.updated', detail: 'Extra record files.mesh.local → 100.64.0.5', color: 'var(--blue)' },
              { time: '3 hr ago', action: 'user.created', detail: 'New namespace "staging" created', color: 'var(--amber)' },
              { time: '1 day ago', action: 'node.removed', detail: 'old-server deregistered from mesh', color: 'var(--red)' },
              { time: '2 days ago', action: 'alert.test', detail: 'Test webhook delivered to Slack', color: 'var(--orange)' },
            ].map((row, i) => (
              <div key={i} className="grid px-5 py-3" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
                <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>{row.time}</span>
                <span className="text-[12px] font-mono font-medium" style={{ color: row.color, fontFamily: 'var(--font-mono)' }}>{row.action}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{row.detail}</span>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(9,9,11,0.95))', pointerEvents: 'none' }} />
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>What Gets Logged</p>
          <div className="grid grid-cols-2 gap-4">
            {WHAT_GETS_LOGGED.map(item => (
              <div key={item.title} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-2)' }}>{item.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  } else if (!configured) {
    main = (
      <Card key="kv-not-configured">
        <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Vercel KV isn&apos;t configured, so events aren&apos;t being recorded yet.</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>Create a KV store in Vercel → Storage and redeploy to start logging.</p>
      </Card>
    );
  } else if (events.length === 0) {
    main = (
      <Card key="no-events">
        <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No events yet.</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>Actions like key generation, node changes, and ACL updates will show up here. Search, filter, and export CSV once events land.</p>
      </Card>
    );
  } else {
    main = <AuditClient key="events-table" events={events} />;
  }

  const pane = !plan.isPro ? (
    <ProShowcase key="pro-showcase" />
  ) : (
    <ContextSection key="what-gets-logged" title="What Gets Logged" items={WHAT_GETS_LOGGED} />
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader
        title="Audit Log"
        subtitle={plan.isPro && configured ? 'Last 500 events · search, filter, export CSV' : undefined}
        actions={
          plan.isPro && !configured && (
            <Badge variant="amber">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Vercel KV not configured — events won&apos;t be stored
            </Badge>
          )
        }
      />

      <SplitView
        main={<div key="audit-main" className="flex-1 overflow-y-auto custom-scrollbar pr-2 pt-2" style={{ minHeight: 0 }}>{main}</div>}
        pane={<div key="audit-pane">{pane}</div>}
      />
    </div>
  );
}
