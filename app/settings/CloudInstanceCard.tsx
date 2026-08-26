import { Badge, Card } from '@/components/ui';

type InstanceStatus = 'provisioning' | 'active' | 'error' | string;

export default function CloudInstanceCard({
  instance,
}: {
  instance: {
    url: string;
    status: InstanceStatus;
    region: string | null;
    errorMessage: string | null;
    provisionedAt: Date | null;
  };
}) {
  const accent =
    instance.status === 'active' ? 'var(--green)'
    : instance.status === 'error' ? 'var(--red)'
    : 'var(--amber)';

  const badge =
    instance.status === 'active' ? { variant: 'green' as const, label: 'Live' }
    : instance.status === 'error' ? { variant: 'red' as const, label: 'Needs attention' }
    : { variant: 'amber' as const, label: 'Provisioning' };

  return (
    <Card accent={accent} padded={false} className="animate-fade-in-up">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-1)' }}>Cloud Instance</h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
              Dedicated Headscale, hosted by LavaMesh
            </p>
          </div>
          <Badge variant={badge.variant} dot={instance.status !== 'error'} pulse={instance.status === 'provisioning'}>
            {badge.label}
          </Badge>
        </div>

        {instance.status === 'provisioning' && (
          <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--text-3)' }}>
            Your machine is booting. This usually takes under a minute — we&apos;ll email you when it&apos;s ready.
          </p>
        )}

        {instance.status === 'error' && instance.errorMessage && (
          <p className="text-[12px] leading-relaxed mb-4 px-3 py-2 rounded-[8px]" style={{ color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {instance.errorMessage}
          </p>
        )}

        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Control Server</span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            {instance.url || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Region</span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>{instance.region || '—'}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Ready since</span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>
            {instance.provisionedAt
              ? instance.provisionedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
        </div>
      </div>
    </Card>
  );
}
