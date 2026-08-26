'use client';
import { ReactNode, useEffect, useState } from 'react';

interface SplitViewProps {
  main: ReactNode;
  pane: ReactNode;
  /** Full-width stat tiles rendered above the main/pane split. */
  stats?: ReactNode;
  /** Column count for the stats grid only (main/pane is always 1fr + fixed pane). */
  columns?: 3 | 4;
  /** Fixed pane width in px on desktop. */
  paneWidth?: number;
  mainClassName?: string;
  autoOpenSignal?: string | number | null;
  /** 'inner' (default) pins stats + scrolls the table/pane internally (pure tables).
   *  'page' lets the whole surface scroll and sticks the pane alongside (dashboard,
   *  which has a tall topology panel below the table). */
  scroll?: 'inner' | 'page';
}

/**
 * Shared fleet layout: an optional full-width stats strip above a
 * flexible main column + a fixed-width context/inspector pane.
 * <1280px the pane becomes a slide-over drawer opened by a floating button.
 */
export function SplitView({
  main,
  pane,
  stats,
  columns = 4,
  paneWidth = 320,
  mainClassName = '',
  autoOpenSignal,
  scroll = 'inner',
}: SplitViewProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Pages that pass autoOpenSignal (Nodes/Users) drive the drawer entirely off
  // selection state: opening on select, closing on deselect. Their pane content
  // already renders its own close/deselect affordance, so the generic floating
  // close button below would just duplicate it — hence it's suppressed for them.
  const hasContentDrivenClose = autoOpenSignal !== undefined;

  useEffect(() => {
    if (autoOpenSignal === undefined) return;
    setMobileOpen(autoOpenSignal !== null);
  }, [autoOpenSignal]);

  return (
    <div
      className={`split-view px-8 ${scroll === 'page' ? 'split-view--page' : 'flex-1 overflow-hidden'}`}
      data-pane-open={mobileOpen}
      data-cols={columns}
      style={{ minHeight: 0, ['--split-pane-width' as string]: `${paneWidth}px` }}
    >
      {stats && <div className="split-stats">{stats}</div>}

      <div className={`split-main ${mainClassName}`}>{main}</div>

      {mobileOpen && <div className="split-pane-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className="split-pane custom-scrollbar" data-no-mobile-close-btn={hasContentDrivenClose}>
        {!hasContentDrivenClose && (
          <button className="split-pane-close-mobile" onClick={() => setMobileOpen(false)} aria-label="Close panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
        {pane}
      </div>

      {/* Content-driven pages (Nodes/Users) open the pane by tapping a row, so this
          generic "open panel" FAB would just float redundantly on top of it. */}
      {!hasContentDrivenClose && (
        <button className="split-pane-mobile-trigger" onClick={() => setMobileOpen(true)} aria-label="Open panel" title="Details">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      )}
    </div>
  );
}
