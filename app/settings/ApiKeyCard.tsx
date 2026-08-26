'use client';
import { useState, useTransition, useEffect } from 'react';
import { generateApiKeyAction, revokeApiKeyAction } from '@/app/actions';
import type { ApiKeyRecord } from '@/lib/apikeys';
import { Badge, Button, Card } from '@/components/ui';

export default function ApiKeyCard({
  apiKey,
  kvReady,
  isPro,
}: {
  apiKey: ApiKeyRecord | null;
  kvReady: boolean;
  isPro: boolean;
}) {
  const [currentKey, setCurrentKey] = useState<ApiKeyRecord | null>(apiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, startGenerate] = useTransition();
  const [revoking, startRevoke] = useTransition();
  const [origin, setOrigin] = useState('https://www.lavamesh.com');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const generate = () => {
    startGenerate(async () => {
      const record = await generateApiKeyAction();
      setCurrentKey(record);
      setRevealed(true);
    });
  };

  const revoke = () => {
    startRevoke(async () => {
      await revokeApiKeyAction();
      setCurrentKey(null);
      setRevealed(false);
    });
  };

  const copy = async () => {
    if (!currentKey) return;
    await navigator.clipboard.writeText(currentKey.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedToken = currentKey
    ? revealed
      ? currentKey.token
      : currentKey.token.slice(0, 7) + '•'.repeat(20)
    : null;

  return (
    <Card padded={false} className="animate-fade-in-up" style={{ animationDelay: '60ms' }} accent={isPro ? 'var(--orange)' : undefined}>
      <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Developer API Key</h2>
          <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
            Use with <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>Authorization: Bearer lm_…</code> to access <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>/api/v1/*</code>
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
            Generate API keys for programmatic access to <code style={{ fontFamily: 'var(--font-mono)' }}>/api/v1/*</code> on the Pro or Cloud plan.
          </p>
          <a href="/#pricing" target="_blank" rel="noopener noreferrer" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
        </div>
      ) : currentKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <code className="flex-1 text-[12px] truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{maskedToken}</code>
            <Button variant="ghost" onClick={() => setRevealed(r => !r)} className="text-[11px] px-2 py-1 rounded-[7px]" style={{ flexShrink: 0 }}>
              {revealed ? 'Hide' : 'Reveal'}
            </Button>
            <Button variant="ghost" onClick={copy} className="text-[11px] px-2 py-1 rounded-[7px]" style={{ flexShrink: 0 }}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
          {currentKey.lastUsed && (
            <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>
              Last used: {new Date(currentKey.lastUsed).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" onClick={generate} disabled={generating || !kvReady} className="text-[12px]">
              {generating ? 'Regenerating…' : 'Regenerate'}
            </Button>
            <Button variant="danger" onClick={revoke} disabled={revoking || !kvReady} className="text-[12px]">
              {revoking ? 'Revoking…' : 'Revoke'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px]" style={{ color: 'var(--text-4)' }}>No API key generated yet.</p>
          <Button variant="primary" onClick={generate} disabled={generating || !kvReady} className="text-[13px]">
            {generating ? (
              <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</>
            ) : 'Generate API Key'}
          </Button>
        </div>
      )}

      {/* Usage examples */}
      {isPro && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-1)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Examples</p>
          <p className="text-[11px] mb-2" style={{ color: 'var(--text-4)' }}>
            Headscale 0.23+ uses <code style={{ fontFamily: 'var(--font-mono)' }}>/node</code>. The proxy also accepts <code style={{ fontFamily: 'var(--font-mono)' }}>/machine</code> and retries automatically.
          </p>
          <pre className="text-[11px] px-3 py-2.5 rounded-[8px] overflow-x-auto" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
{`ORIGIN="${origin}"
KEY="${currentKey?.token ?? 'lm_…'}"

# List nodes (0.23+)
curl "$ORIGIN/api/v1/node" -H "Authorization: Bearer $KEY"

# Same on Headscale 0.22
curl "$ORIGIN/api/v1/machine" -H "Authorization: Bearer $KEY"

# Users + ACL policy
curl "$ORIGIN/api/v1/user" -H "Authorization: Bearer $KEY"
curl "$ORIGIN/api/v1/policy" -H "Authorization: Bearer $KEY"`}
          </pre>
        </div>
      )}
      </div>
    </Card>
  );
}
