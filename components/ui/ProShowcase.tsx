'use client';
import { Badge } from './Badge';

const PRO_FEATURES = [
  'Unlimited team members',
  'Searchable audit log + CSV export',
  'Visual ACL builder (merges into your policy)',
  'Webhook alerts with a send-test button',
  'Subnet route failover alerts',
  'Automated config backups',
  'Priority email support',
];

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)', flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Condensed version of the landing page's Pro plan card (see PricingSection.tsx,
 * kept in sync with it) — the single reusable "here's why Pro is worth it" surface
 * used by the Sidebar upgrade modal, the Audit Log pane, and the Settings rail.
 */
export function ProShowcase({ onClose }: { onClose?: () => void }) {
  return (
    <div className="relative flex flex-col gap-4 p-5 rounded-[12px]" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.05) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,107,26,0.14)' }}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn btn-ghost p-1.5 rounded-[8px]"
          style={{ border: 'none', color: 'var(--text-3)' }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}
      <div>
        <Badge variant="orange" className="mb-2.5 text-[10px] uppercase tracking-wider">Pro</Badge>
        <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-1)' }}>Unlock LavaMesh Pro</h3>
        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--text-4)' }}>Everything in Community, plus the tools serious operators need.</p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {PRO_FEATURES.map(f => (
          <li key={f} className="flex items-center gap-2.5 text-[12.5px]" style={{ color: 'var(--text-2)' }}>
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <div className="flex items-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border-1)' }}>
        <span className="text-[26px] font-bold leading-none" style={{ color: 'var(--text-1)' }}>$19</span>
        <span className="text-[12px] mb-0.5" style={{ color: 'var(--text-4)' }}>/mo · or $149 lifetime</span>
      </div>
      <a href="/#pricing" className="btn btn-primary justify-center text-[13px] w-full" style={{ borderRadius: 10 }}>
        View plans &amp; pricing →
      </a>
    </div>
  );
}
