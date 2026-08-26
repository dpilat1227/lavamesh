'use client';
import { Badge } from './Badge';
import { STRIPE_MONTHLY_LINK, STRIPE_LIFETIME_LINK } from '@/lib/pricing';

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
    <div className="relative flex flex-col gap-4 p-5 rounded-[12px]" style={{ background: 'linear-gradient(135deg, rgba(255,115,0,0.05) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,115,0,0.14)' }}>
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
      {/* Opens Stripe checkout in a new tab instead of navigating this tab to
          the marketing site — clicking "view pricing" from inside the
          dashboard shouldn't make someone wonder if they got signed out. */}
      <div className="flex gap-2">
        <a href={STRIPE_MONTHLY_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary justify-center text-[13px] flex-1" style={{ borderRadius: 10 }}>
          Monthly →
        </a>
        <a href={STRIPE_LIFETIME_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-center text-[13px] flex-1" style={{ borderRadius: 10 }}>
          Lifetime →
        </a>
      </div>
      <a href="/#pricing" target="_blank" rel="noopener noreferrer" className="text-center text-[11px]" style={{ color: 'var(--text-4)', textDecoration: 'none' }}>
        Full plan comparison ↗
      </a>
    </div>
  );
}
