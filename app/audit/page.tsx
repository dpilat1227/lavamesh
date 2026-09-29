import type { ReactNode } from 'react';
import { getAuditLog } from '@/lib/audit';
import { kvConfigured } from '@/lib/kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge, Card, EmptyState, PageHeader, SplitView, ContextSection } from '@/components/ui';
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

  const configured = kvConfigured();
  const events = configured ? await getAuditLog(500) : [];

  let main: ReactNode;

  if (!configured) {
    main = (
      <Card key="kv-not-configured">
        <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Vercel KV isn&apos;t configured, so events aren&apos;t being recorded yet.</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>Create a KV store in Vercel → Storage and redeploy to start logging.</p>
      </Card>
    );
  } else if (events.length === 0) {
    main = (
      <Card key="no-events" padded={false}>
        <EmptyState
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          title="No events recorded yet"
          description="Logging is live. Key generation, node changes, and ACL updates will appear here — then you can search, filter, and export them as CSV."
          action={
            <a href="/keys" className="text-[12.5px] font-medium" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
              Generate a key to see your first event →
            </a>
          }
        />
      </Card>
    );
  } else {
    main = <AuditClient key="events-table" events={events} />;
  }

  const pane = (
    <ContextSection key="what-gets-logged" title="What Gets Logged" items={WHAT_GETS_LOGGED} />
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader
        title="Audit Log"
        subtitle={configured ? 'Last 500 events · search, filter, export CSV' : undefined}
        actions={
          !configured && (
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
