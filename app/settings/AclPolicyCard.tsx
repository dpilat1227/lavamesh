'use client';
import { useState } from 'react';
import AclEditor from './AclEditor';
import AclBuilder from './AclBuilder';
import { SegmentedControl } from '@/components/ui';

export default function AclPolicyCard({
  initialPolicy,
  policyAvailable,
}: {
  initialPolicy: string;
  policyAvailable: boolean;
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
            label: 'Visual Builder',
          },
          { value: 'raw', label: 'Raw HuJSON' },
        ]}
      />
      {tab === 'builder' ? (
        <AclBuilder />
      ) : (
        <AclEditor initialPolicy={initialPolicy} policyAvailable={policyAvailable} />
      )}
    </div>
  );
}
