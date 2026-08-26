'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui';

/**
 * Shown instead of the normal dashboard while a Cloud tenant's dedicated
 * Headscale instance is still booting (or failed to). Polls
 * /api/tenant/cloud-status and refreshes the page the moment it goes
 * 'active', so the user never has to manually reload.
 */
export default function CloudProvisioningStatus({ initialStatus, initialError }: { initialStatus: string; initialError: string | null }) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'provisioning') return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/tenant/cloud-status', { cache: 'no-store' });
        const data = await res.json();
        if (data.status && data.status !== status) {
          setStatus(data.status);
          setError(data.errorMessage || null);
          if (data.status === 'active') {
            if (pollRef.current) clearInterval(pollRef.current);
            router.refresh();
          }
        }
      } catch {
        // transient — keep polling
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, router]);

  const isError = status === 'error';

  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
      <div className="max-w-[420px] text-center px-6">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-6"
          style={{
            background: isError ? 'var(--red-soft)' : 'var(--orange-soft)',
            border: `1px solid ${isError ? 'rgba(248,113,113,0.2)' : 'rgba(255,115,0,0.2)'}`,
          }}
        >
          {isError ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: '2s' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          )}
        </div>

        <h2 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
          {isError ? 'Provisioning ran into a problem' : 'Setting up your Cloud instance'}
        </h2>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-4)' }}>
          {isError
            ? (error || 'Something went wrong while creating your dedicated Headscale instance.')
            : 'We\u2019re spinning up a dedicated, isolated Headscale instance just for you. This usually takes 1\u20132 minutes.'}
        </p>

        {isError ? (
          <Badge variant="red">Contact support if this persists</Badge>
        ) : (
          <Badge variant="amber" pulse dot>Provisioning\u2026</Badge>
        )}
      </div>
    </div>
  );
}
