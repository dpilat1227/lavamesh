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
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Audit Log</h1>
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
          <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--text-4)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p className="text-[13px]">{configured ? 'No events recorded yet' : 'Vercel KV required'}</p>
            {!configured && (
              <p className="text-[12px] text-center max-w-xs" style={{ color: 'var(--text-4)' }}>
                Create a KV database in Vercel → Storage, then redeploy.
              </p>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* Header row */}
            <div className="grid px-5 py-3" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
              {['Time', 'Action', 'Details'].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
              ))}
            </div>
            {events.map((event, i) => (
              <div key={event.id}
                className="grid items-center px-5 py-3"
                style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: i < events.length - 1 ? '1px solid var(--border-1)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
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
