'use client';
import { ReactNode, useEffect, useState } from 'react';

interface SplitViewProps {
  main: ReactNode;
  pane: ReactNode;
  /** Stat tiles that share the same column grid as the table + pane so edges line up. */
  stats?: ReactNode;
  /** 4 = dashboard (table spans 3, pane is the 4th column). 3 = routes (table spans 2). */
  columns?: 3 | 4;
  paneWidth?: number;
  mainClassName?: string;
  autoOpenSignal?: string | number | null;
}

/**
 * Shared fleet layout: stats, table, and inspector sit on one CSS grid so
 * Needs Attention lines up with the last stat tile (Uptime / Total Routes).
 * <1280px the pane becomes a slide-over drawer.
 */
export function SplitView({
  main,
  pane,
  stats,
  columns = 4,
  paneWidth = 300,
  mainClassName = '',
  autoOpenSignal,
}: SplitViewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (autoOpenSignal !== undefined && autoOpenSignal !== null) {
      setMobileOpen(true);
    }
  }, [autoOpenSignal]);

  return (
    <div
      className="split-view flex-1 overflow-hidden px-8"
      data-collapsed={collapsed}
      data-pane-open={mobileOpen}
      data-cols={columns}
      style={{ minHeight: 0, ['--split-pane-width' as string]: `${paneWidth}px` }}
    >
      {stats && <div className="split-stats">{stats}</div>}

      <div className={`split-main ${mainClassName}`}>{main}</div>

      {mobileOpen && <div className="split-pane-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className="split-pane custom-scrollbar">
        <button
          className="split-pane-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Show panel' : 'Hide panel'}
          title={collapsed ? 'Show panel' : 'Hide panel'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="split-pane-close-mobile" onClick={() => setMobileOpen(false)} aria-label="Close panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        {pane}
      </div>

      {collapsed && (
        <button
          className="split-pane-collapse-btn"
          style={{ position: 'fixed', top: 84, right: 24, background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}
          onClick={() => setCollapsed(false)}
          aria-label="Show panel"
          title="Show panel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <button className="split-pane-mobile-trigger" onClick={() => setMobileOpen(true)} aria-label="Open panel" title="Details">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
    </div>
  );
}
