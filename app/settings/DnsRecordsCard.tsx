'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveDnsRecordsAction } from '@/app/actions';
import type { DnsExtraRecord } from '@/lib/policyDns';
import { Badge, Button } from '@/components/ui';

const TYPES = ['A', 'AAAA', 'CNAME'] as const;

export default function DnsRecordsCard({
  records,
  policyAvailable,
}: {
  records: DnsExtraRecord[];
  policyAvailable: boolean;
}) {
  const [rows, setRows] = useState<DnsExtraRecord[]>(records);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const dirty = JSON.stringify(rows) !== JSON.stringify(records);

  const add = () => setRows(r => [...r, { name: '', type: 'A', value: '' }]);
  const remove = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));

  const save = () => {
    startTransition(async () => {
      try {
        await saveDnsRecordsAction(rows.filter(r => r.name.trim() && r.value.trim()));
        setStatus('saved');
        router.refresh();
        setTimeout(() => setStatus('idle'), 3000);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e?.message || 'Failed to save DNS records');
      }
    });
  };

  return (
    <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-1)' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Extra DNS records</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>
            A / AAAA / CNAME entries written to the ACL policy as <code style={{ fontFamily: 'var(--font-mono)' }}>dns.extra_records</code>
          </p>
        </div>
        <Button variant="ghost" onClick={add} disabled={!policyAvailable} className="text-[11px] px-2 py-1">
          + Add
        </Button>
      </div>

      {!policyAvailable && (
        <p className="text-[12px] mb-2" style={{ color: 'var(--text-4)' }}>
          Headscale policy API isn&apos;t available — extra records can&apos;t be edited from here.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>No extra records yet. Add a hostname that should resolve inside the mesh.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input text-[12px] py-1.5 flex-1"
                placeholder="files.mesh.local"
                value={row.name}
                onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <select
                className="input text-[12px] py-1.5"
                value={row.type}
                onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, type: e.target.value } : x))}
                style={{ width: 90, fontFamily: 'var(--font-mono)' }}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                className="input text-[12px] py-1.5 flex-1"
                placeholder="100.64.0.5"
                value={row.value}
                onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove record"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div>
          {status === 'saved' && (
            <Badge variant="green" className="animate-fade-in">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="red" className="animate-fade-in text-[11px] max-w-[320px] truncate">{errorMsg}</Badge>
          )}
          {dirty && status === 'idle' && (
            <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>Unsaved · rewriting policy as JSON (comments stripped)</span>
          )}
        </div>
        <Button variant="primary" onClick={save} disabled={isPending || !dirty || !policyAvailable} className="text-[12px] px-3 py-1.5" style={{ opacity: !dirty ? 0.5 : 1 }}>
          {isPending ? 'Saving…' : 'Save records'}
        </Button>
      </div>
    </div>
  );
}
