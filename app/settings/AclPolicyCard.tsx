'use client';
import { useState } from 'react';
import AclEditor from './AclEditor';
import AclBuilder from './AclBuilder';
import { Badge } from '@/components/ui';

export default function AclPolicyCard({
  initialPolicy,
  policyAvailable,
  isPro,
}: {
  initialPolicy: string;
  policyAvailable: boolean;
  isPro: boolean;
}) {
  const [tab, setTab] = useState<'builder' | 'raw'>('raw');

  const tabBtn = (id: 'builder' | 'raw', label: string) => (
    <button
      onClick={() => setTab(id)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors"
      style={{
        background: tab === id ? 'var(--surface-2)' : 'transparent',
        color: tab === id ? 'var(--text-1)' : 'var(--text-4)',
      }}
    >
      {label}
      {id === 'builder' && !isPro && <Badge variant="ghost" className="text-[9px]">Pro</Badge>}
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 p-0.5 rounded-[10px] w-fit" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}>
        {tabBtn('builder', 'Visual Builder')}
        {tabBtn('raw', 'Raw HuJSON')}
      </div>
      {tab === 'builder' ? (
        <AclBuilder isPro={isPro} />
      ) : (
        <AclEditor initialPolicy={initialPolicy} policyAvailable={policyAvailable} />
      )}
    </div>
  );
}
