'use client';
import { ReactNode, useState } from 'react';
import { Card } from './Card';

export interface ContextItem {
  title: string;
  desc: string;
  icon: ReactNode;
  color: string;
}

interface ContextSectionProps {
  title: string;
  accent?: string;
  items: ContextItem[];
  /** When true, renders as a click-to-expand disclosure instead of always-open — use for evergreen
   * documentation so it doesn't permanently occupy the inspector's primary real estate. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

/** The "documentation" card pattern shared by the Routes/Keys/Users context panes. */
export function ContextSection({ title, accent, items, collapsible = false, defaultOpen }: ContextSectionProps) {
  const [open, setOpen] = useState(defaultOpen ?? !collapsible);

  return (
    <Card accent={accent} padded={false}>
      <div className="p-5">
        <button
          type="button"
          onClick={() => collapsible && setOpen(o => !o)}
          className="w-full flex items-center justify-between"
          style={{ background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default' }}
          aria-expanded={collapsible ? open : undefined}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>{title}</p>
          {collapsible && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--text-4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
        {open && (
          <div className="flex flex-col gap-6 mt-4">
            {items.map(item => (
              <div key={item.title}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px]" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                    {item.icon}
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>{item.title}</p>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export interface InsightItem {
  label: string;
  value?: string;
  tone?: 'default' | 'amber' | 'red' | 'green';
  onClick?: () => void;
}

const TONE_COLOR: Record<NonNullable<InsightItem['tone']>, string> = {
  default: 'var(--text-2)',
  amber: 'var(--amber)',
  red: 'var(--red)',
  green: 'var(--green)',
};

/**
 * The pane's default "nothing selected" state should be a live, computed summary — never
 * evergreen copy. This renders a small list of real facts (pending approvals, expiring keys,
 * empty namespaces, etc.) with an honest empty-state message when there's nothing to flag.
 */
export function InsightCard({ title, accent, items, emptyLabel }: { title: string; accent?: string; items: InsightItem[]; emptyLabel: string }) {
  return (
    <Card accent={accent} padded={false}>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>{title}</p>
        {items.length === 0 ? (
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{emptyLabel}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((item, i) => {
              const Tag = item.onClick ? 'button' : 'div';
              return (
                <Tag
                  key={i}
                  onClick={item.onClick}
                  className="flex items-center justify-between gap-3 py-1.5 text-left"
                  style={{ background: 'none', border: 'none', cursor: item.onClick ? 'pointer' : 'default', width: '100%' }}
                >
                  <span className="text-[12px] truncate" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                  {item.value && (
                    <span className="text-[11px] font-medium flex-shrink-0" style={{ color: TONE_COLOR[item.tone ?? 'default'] }}>{item.value}</span>
                  )}
                </Tag>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

interface UpsellCardProps {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  ctaLabel?: string;
}

/** The Pro/Cloud upsell card pattern — now an actual link instead of static, dead-end copy. */
export function UpsellCard({ eyebrow, eyebrowColor, title, description, icon, href = '/#pricing', ctaLabel = 'Upgrade' }: UpsellCardProps) {
  return (
    <div
      className="rounded-[12px] overflow-hidden p-5 flex flex-col gap-3 relative"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: eyebrowColor, letterSpacing: '0.08em' }}>{eyebrow}</p>
      <h3 className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>{title}</h3>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{description}</p>
      <a href={href} className="text-[12px] font-medium mt-1 inline-flex items-center gap-1 w-fit" style={{ color: 'var(--orange)' }}>
        {ctaLabel}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
      </a>
    </div>
  );
}
