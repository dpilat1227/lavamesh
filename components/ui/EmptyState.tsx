import type { ReactNode } from 'react';

/**
 * The shared zero-data surface. Nodes, Keys, Users and Routes each had their
 * own hand-rolled version with different chrome (dashed border or not, icon or
 * not, CTA or not), which meant the pages a brand-new self-hoster sees *first*
 * were the least consistent in the app. Routes was the worst offender: it
 * mentioned CLI flags but gave you nothing to click.
 *
 * Every empty state should answer the same two questions: why is this blank,
 * and what do I do about it.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** The "do this next" affordance. Omit only when there genuinely isn't one. */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14 gap-4">
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text-3)' }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div style={{ maxWidth: 380 }}>
        <p className="text-[14px] font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>{title}</p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{description}</p>
      </div>
      {action}
    </div>
  );
}
