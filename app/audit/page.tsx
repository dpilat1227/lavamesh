import { getAuditLog } from '@/lib/audit';
import { kvConfigured } from '@/lib/kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ACTION_LABELS: Record<string, string> = {
  'node.revoke':      'Node Revoked',
  'node.rename':      'Node Renamed',
  'key.generate':     'Key Generated',
  'key.expire':       'Key Expired',
  'user.create':      'User Created',
  'user.delete':      'User Deleted',
  'user.rename':      'User Renamed',
  'acl.update':       'ACL Updated',
  'tag.set':          'Tags Updated',
  'apikey.generate':  'API Key Generated',
  'apikey.revoke':    'API Key Revoked',
  'auth.login':       'Login',
};

const ACTION_COLORS: Record<string, string> = {
  'node.revoke':      'var(--red)',
  'key.expire':       'var(--red)',
  'user.delete':      'var(--red)',
  'apikey.revoke':    'var(--red)',
  'node.rename':      'var(--orange)',
  'user.rename':      'var(--orange)',
  'tag.set':          'var(--orange)',
  'acl.update':       '#a78bfa',
  'apikey.generate':  '#60a5fa',
  'key.generate':     'var(--green)',
  'user.create':      'var(--green)',
  'auth.login':       'var(--text-3)',
};

function formatMeta(meta: Record<string, string>): string {
  return Object.entries(meta)
    .filter(([k]) => k !== 'actor')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const configured = kvConfigured();
  const events = configured ? await getAuditLog(200) : [];

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Audit Log</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Last 200 events · newest first</p>
        </div>
        {!configured && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fbbf24' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-[12px]" style={{ color: '#fbbf24' }}>Vercel KV not configured — events won&apos;t be stored until KV is set up</p>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-4" style={{ minHeight: 0 }}>
        {events.length === 0 ? (
          <div className="space-y-6">
            {/* Pro CTA banner */}
            <div className="p-5 rounded-[12px] flex items-start gap-4" style={{ background: 'rgba(255,90,0,0.04)', border: '1px solid rgba(255,90,0,0.12)' }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,90,0,0.08)', border: '1px solid rgba(255,90,0,0.20)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--orange)' }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Audit Log — Pro Feature</p>
                <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-3)' }}>
                  Track every action across your mesh network. See who generated keys, provisioned nodes, changed routes, and more — with full timestamps and actor attribution.
                </p>
                <div className="flex items-center gap-3">
                  <a href="/#pricing" className="btn btn-primary text-[12px]" style={{ padding: '7px 16px' }}>Upgrade to Pro →</a>
                  <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>Starting at $19/mo</span>
                </div>
              </div>
            </div>

            {/* Mockup preview — shows what the log looks like when populated */}
            <div className="relative rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="px-5 py-2.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>Preview</span>
              </div>
              {/* Mockup table header */}
              <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
                {['Time', 'Action', 'Details'].map(h => (
                  <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
                ))}
              </div>
              {/* Mockup rows */}
              <div style={{ opacity: 0.5 }}>
                {[
                  { time: '2 min ago', action: 'key.generated', detail: 'Pre-auth key created by admin1 · reusable', color: 'var(--green)' },
                  { time: '15 min ago', action: 'node.registered', detail: 'macbook-air-m1 joined the mesh · 100.64.0.3', color: 'var(--blue)' },
                  { time: '1 hr ago', action: 'route.approved', detail: 'Subnet 192.168.1.0/24 approved for macbook-air-m1', color: 'var(--purple)' },
                  { time: '3 hr ago', action: 'user.created', detail: 'New namespace "staging" created', color: 'var(--amber)' },
                  { time: '1 day ago', action: 'node.removed', detail: 'old-server deregistered from mesh', color: 'var(--red)' },
                  { time: '2 days ago', action: 'key.expired', detail: 'Pre-auth key 9a32... expired', color: 'var(--text-4)' },
                ].map((row, i) => (
                  <div key={i} className="grid px-5 py-3" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
                    <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>{row.time}</span>
                    <span className="text-[12px] font-mono font-medium" style={{ color: row.color, fontFamily: 'var(--font-mono)' }}>{row.action}</span>
                    <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{row.detail}</span>
                  </div>
                ))}
              </div>
              {/* Fade overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(9,9,11,0.95))', pointerEvents: 'none' }} />
            </div>

            {/* Feature explainer */}
            <div className="p-5 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>What Gets Logged</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: 'Key Events', desc: 'Generation, revocation, and expiration of pre-auth keys' },
                  { title: 'Node Events', desc: 'Registration, deregistration, and connectivity changes' },
                  { title: 'Route Changes', desc: 'Subnet and exit node approval, rejection, or removal' },
                  { title: 'User Actions', desc: 'Namespace creation, renaming, deletion, and ACL changes' },
                ].map(item => (
                  <div key={item.title}>
                    <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-2)' }}>{item.title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="grid px-5 py-3" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
              {['Time', 'Action', 'Details'].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
              ))}
            </div>
            {events.map((event, i) => (
              <div key={event.id}
                className="grid items-center px-5 py-3 row-alt"
                style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: i < events.length - 1 ? '1px solid var(--border-1)' : 'none' }}
              >
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{timeAgo(event.ts)}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-4)' }}>
                    {new Date(event.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACTION_COLORS[event.action] ?? 'var(--text-4)' }} />
                  <span className="text-[12px] font-medium" style={{ color: ACTION_COLORS[event.action] ?? 'var(--text-2)' }}>
                    {ACTION_LABELS[event.action] ?? event.action}
                  </span>
                </div>
                <p className="text-[12px] font-mono truncate" style={{ color: 'var(--text-4)' }}>
                  {formatMeta(event.meta) || '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
