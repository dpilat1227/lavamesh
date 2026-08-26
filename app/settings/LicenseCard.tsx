'use client';
import { useState, useTransition } from 'react';
import { activateLicenseAction } from '@/app/actions';
import { Badge, Button, Card } from '@/components/ui';

export default function LicenseCard({ isPro, source }: { isPro: boolean; source: string }) {
  const [key, setKey] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const activate = () => {
    setError('');
    startTransition(async () => {
      try {
        await activateLicenseAction(key);
        setOk(true);
        setKey('');
      } catch (e: any) {
        setError(e?.message || 'Could not activate license');
      }
    });
  };

  if (isPro) {
    return (
      <Card padded={false} className="animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>License</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
                {source === 'license' ? 'Pro is active on this instance via license key.' : source === 'subscription' ? 'Pro/Cloud is active via subscription.' : 'Pro features are unlocked.'}
              </p>
            </div>
            <Badge variant="green" dot>Active</Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card accent="var(--orange)" padded={false} className="animate-fade-in-up">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Activate Pro</h2>
            <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
              After you pay, we email you a key. Paste it here — it unlocks audit log, ACL builder, webhooks, backups, and unlimited seats. No redeploy.
            </p>
          </div>
          <Badge variant="orange" className="text-[10px] uppercase tracking-wider">Pro</Badge>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={key}
            onChange={e => { setKey(e.target.value); setError(''); setOk(false); }}
            placeholder="Paste license key"
            className="input flex-1 text-[13px] py-2"
            style={{ fontFamily: 'var(--font-mono)' }}
            autoComplete="off"
            spellCheck={false}
          />
          <Button variant="primary" onClick={activate} disabled={isPending || key.trim().length < 8} className="px-4 py-2 flex-shrink-0">
            {isPending ? 'Activating…' : 'Activate'}
          </Button>
        </div>
        {error && <p className="text-[12px] mt-3" style={{ color: 'var(--red)' }}>{error}</p>}
        {ok && <p className="text-[12px] mt-3" style={{ color: 'var(--green)' }}>License saved. Pro features are on.</p>}
        <p className="text-[11px] mt-3" style={{ color: 'var(--text-4)' }}>
          Paid but no email yet? Check spam, then <a href="/#pricing" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)', textDecoration: 'none' }}>buy Pro →</a> or write drew@lavamesh.com.
        </p>
      </div>
    </Card>
  );
}
