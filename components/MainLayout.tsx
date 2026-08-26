'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';
import { IconChip } from '@/components/ui';
import type { PlanTier } from '@/lib/planTier';

export default function MainLayout({ children, planTier = 'community', isPro = false, controlHost }: { children: React.ReactNode; planTier?: PlanTier; isPro?: boolean; controlHost?: string }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/' || pathname.startsWith('/draft');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Sidebar — slides in on mobile, fixed on desktop */}
      <div className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
        <Sidebar onClose={() => setSidebarOpen(false)} planTier={planTier} isPro={isPro} controlHost={controlHost} />
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ cursor: 'default' }}
        />
      )}

      {/* Main content area — the lava-diagonal atmosphere (see --atmosphere in
          globals.css): a hot molten glow top-right cooling to a deep ember-red
          bottom-left, fading to calm near-black well before the dense central
          content. Single token so this stays a one-line swap. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0, background: 'var(--atmosphere)' }}>

        {/* Mobile top bar with hamburger */}
        <div className="mobile-top-bar">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <IconChip size={20} radius={6}>
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </IconChip>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>LavaMesh</span>
          </div>
          <div style={{ width: 36 }} /> {/* spacer */}
        </div>
        {children}
      </div>
    </div>
  );
}
