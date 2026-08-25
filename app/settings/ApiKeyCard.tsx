'use client';
import { useState, useTransition } from 'react';
import { generateApiKeyAction, revokeApiKeyAction } from '@/app/actions';
import type { ApiKeyRecord } from '@/lib/apikeys';

export default function ApiKeyCard({
  apiKey,
  kvReady,
}: {
  apiKey: ApiKeyRecord | null;
  kvReady: boolean;
}) {
  const [currentKey, setCurrentKey] = useState<ApiKeyRecord | null>(apiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, startGenerate] = useTransition();
  const [revoking, startRevoke] = useTransition();

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
    <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '60ms' }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)' }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Developer API Key</h2>
          <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
            Use with <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>Authorization: Bearer lm_…</code> to access <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>/api/v1/*</code>
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>Pro</span>
      </div>

      {!kvReady && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fbbf24', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[11px]" style={{ color: '#fbbf24' }}>Requires Vercel KV — create one in Vercel → Storage</p>
        </div>
      )}

      {currentKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
            <code className="flex-1 text-[12px] truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{maskedToken}</code>
            <button onClick={() => setRevealed(r => !r)} className="btn btn-ghost text-[11px] px-2 py-1 rounded-[7px]" style={{ flexShrink: 0 }}>
              {revealed ? 'Hide' : 'Reveal'}
            </button>
            <button onClick={copy} className="btn btn-ghost text-[11px] px-2 py-1 rounded-[7px]" style={{ flexShrink: 0 }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {currentKey.lastUsed && (
            <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>
              Last used: {new Date(currentKey.lastUsed).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={generate} disabled={generating || !kvReady} className="btn btn-ghost text-[12px] flex-1 justify-center">
              {generating ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button onClick={revoke} disabled={revoking || !kvReady} className="btn btn-danger text-[12px] flex-1 justify-center">
              {revoking ? 'Revoking…' : 'Revoke'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px]" style={{ color: 'var(--text-4)' }}>No API key generated yet.</p>
          <button onClick={generate} disabled={generating || !kvReady} className="btn btn-primary text-[13px]">
            {generating ? (
              <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</>
            ) : 'Generate API Key'}
          </button>
        </div>
      )}

      {/* Usage example */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-1)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Example</p>
        <pre className="text-[11px] px-3 py-2.5 rounded-[8px] overflow-x-auto" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
{`curl https://www.lavamesh.com/api/v1/machine \\
  -H "Authorization: Bearer ${currentKey?.token ?? 'lm_…'}"`}
        </pre>
      </div>
    </div>
  );
}
