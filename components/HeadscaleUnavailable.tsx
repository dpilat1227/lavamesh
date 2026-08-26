import { Card } from '@/components/ui';

/** Shown when the dashboard can't reach Headscale — better than a Next.js error overlay. */
export default function HeadscaleUnavailable({ message }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-8" style={{ minHeight: 0 }}>
      <Card className="max-w-[480px] w-full">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--amber)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Can&apos;t reach Headscale</h2>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-3)' }}>
              The dashboard is up, but the control plane didn&apos;t respond. Check that Headscale is running and that <code style={{ fontFamily: 'var(--font-mono)' }}>HEADSCALE_API_URL</code> / <code style={{ fontFamily: 'var(--font-mono)' }}>HEADSCALE_API_KEY</code> are set.
            </p>
            {message && (
              <p className="text-[11px] font-mono px-3 py-2 rounded-[8px] mb-3" style={{ color: 'var(--text-4)', background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}>
                {message}
              </p>
            )}
            <a href="/settings" className="text-[13px] font-medium" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
              Open Settings →
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
