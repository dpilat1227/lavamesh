'use client';
import { useState, useTransition } from 'react';
import { createBackupAction, restoreBackupPolicyAction } from '@/app/actions';
import type { BackupSummary } from '@/lib/backups';
import { Badge, Button, Card } from '@/components/ui';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BackupsCard({ initialBackups, isPro, kvReady }: { initialBackups: BackupSummary[]; isPro: boolean; kvReady: boolean }) {
  const [backups, setBackups] = useState(initialBackups);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restored, setRestored] = useState('');

  const runBackup = () => {
    setError('');
    startTransition(async () => {
      try {
        const summary = await createBackupAction();
        setBackups(prev => [summary, ...prev].slice(0, 30));
      } catch (e: any) {
        setError(e?.message || 'Failed to create backup');
      }
    });
  };

  const restore = (id: string) => {
    setError('');
    setRestored('');
    setRestoringId(id);
    startTransition(async () => {
      try {
        await restoreBackupPolicyAction(id);
        setRestored(id);
      } catch (e: any) {
        setError(e?.message || 'Failed to restore policy');
      } finally {
        setRestoringId(null);
      }
    });
  };

  return (
    <Card padded={false} className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Config Backups</h2>
            <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
              Snapshots of your ACL policy, users, and node roster. Restore a policy or download the JSON.
            </p>
          </div>
          <Badge variant="orange" className="text-[10px] uppercase tracking-wider">Pro</Badge>
        </div>

        {!kvReady && isPro && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fbbf24', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-[11px]" style={{ color: '#fbbf24' }}>Requires Vercel KV — create one in Vercel → Storage</p>
          </div>
        )}

        {!isPro ? (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.16)' }}>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
              Daily snapshots of your ACL policy and node roster, with one-click policy restore.
            </p>
            <a href="/#pricing" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={runBackup} disabled={isPending || !kvReady} className="text-[12px]">
                {isPending ? 'Backing up…' : 'Back up now'}
              </Button>
              {error && <Badge variant="red" className="text-[11px] max-w-[280px] truncate">{error}</Badge>}
            </div>

            {backups.length === 0 ? (
              <p className="text-[12px] mt-2" style={{ color: 'var(--text-4)' }}>
                No backups yet. One will be taken automatically tonight, or trigger one above.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {backups.slice(0, 8).map(b => (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-[8px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.trigger === 'scheduled' ? 'var(--blue)' : 'var(--green)' }} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>{formatWhen(b.ts)}</p>
                        <p className="text-[10.5px]" style={{ color: 'var(--text-4)' }}>
                          {b.nodeCount} node{b.nodeCount === 1 ? '' : 's'} · {b.userCount} user{b.userCount === 1 ? '' : 's'} · {b.trigger === 'scheduled' ? 'automatic' : 'manual'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {b.hasPolicy && (
                        <button
                          onClick={() => restore(b.id)}
                          disabled={isPending}
                          className="text-[11px] font-medium"
                          style={{ color: restored === b.id ? 'var(--green)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {restoringId === b.id ? 'Restoring…' : restored === b.id ? 'Policy restored' : 'Restore policy'}
                        </button>
                      )}
                      <a href={`/api/backups/${b.id}`} className="text-[11px] font-medium" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
