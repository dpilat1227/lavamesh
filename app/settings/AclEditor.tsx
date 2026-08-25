'use client';
import { useState, useTransition } from 'react';
import { updatePolicyAction } from '@/app/actions';
import { Badge, Button } from '@/components/ui';

export default function AclEditor({ initialPolicy, policyAvailable }: { initialPolicy: string; policyAvailable: boolean }) {
  const [policy, setPolicy] = useState(initialPolicy);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const isDirty = policy !== initialPolicy;

  const save = () => {
    startTransition(async () => {
      try {
        await updatePolicyAction(policy);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e?.message || 'Failed to save policy');
      }
    });
  };

  return (
    <div className="space-y-3">
      {!policyAvailable && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--amber-soft)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--amber)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[12px]" style={{ color: 'var(--amber)' }}>Policy API not available on this Headscale version. Changes may not persist.</p>
        </div>
      )}

      <div className="relative">
        <textarea
          value={policy}
          onChange={e => { setPolicy(e.target.value); setStatus('idle'); }}
          rows={14}
          className="w-full px-4 py-3 rounded-[12px] text-[12px] leading-relaxed resize-none focus:outline-none transition-all"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${isDirty ? 'rgba(255,90,0,0.3)' : 'var(--border-2)'}`,
            color: 'var(--text-2)',
            fontFamily: 'var(--font-mono)',
            boxShadow: isDirty ? '0 0 0 3px rgba(255,90,0,0.06)' : 'none',
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {status === 'saved' && (
            <Badge variant="green" className="animate-fade-in">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Policy saved
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="red" className="animate-fade-in text-[11px] max-w-[300px] truncate">{errorMsg}</Badge>
          )}
          {isDirty && status === 'idle' && (
            <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>Unsaved changes</span>
          )}
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="ghost" onClick={() => { setPolicy(initialPolicy); setStatus('idle'); }} className="text-[12px] px-3 py-1.5">Reset</Button>
          )}
          <Button
            variant="primary"
            onClick={save}
            disabled={isPending || !isDirty}
            className="text-[12px] px-4 py-1.5"
            style={{ opacity: !isDirty ? 0.5 : 1 }}
          >
            {isPending ? 'Saving…' : 'Save Policy'}
          </Button>
        </div>
      </div>
    </div>
  );
}
