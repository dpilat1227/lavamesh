'use client';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Stat row / bento grid rendered below the title, e.g. <StatCard /> tiles. */
  stats?: ReactNode;
}

/** Consistent title + subtitle + actions + stat-row header shared by every dashboard page. */
export function PageHeader({ title, subtitle, actions, stats }: PageHeaderProps) {
  return (
    <header className="page-header flex-shrink-0 px-8 pt-6 pb-5">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-tight truncate" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p className="text-[12.5px] mt-1" style={{ color: 'var(--text-4)' }}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {stats}
    </header>
  );
}
