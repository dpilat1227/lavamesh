'use client';
import { useState } from 'react';
import AclEditor from './AclEditor';
import AclBuilder from './AclBuilder';
import { Badge, SegmentedControl } from '@/components/ui';

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

  return (
    <div>
      <SegmentedControl
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          {
            value: 'builder',
            label: (
              <>
                Visual Builder
                {!isPro && <Badge variant="orange" className="text-[9px]">Pro</Badge>}
              </>
            ),
          },
          { value: 'raw', label: 'Raw HuJSON' },
        ]}
      />
      {tab === 'builder' ? (
        <AclBuilder isPro={isPro} />
      ) : (
        <AclEditor initialPolicy={initialPolicy} policyAvailable={policyAvailable} />
      )}
    </div>
  );
}
