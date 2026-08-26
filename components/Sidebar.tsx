'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { navSections } from './navConfig';
import { Badge, IconChip, Modal, ProShowcase } from './ui';
import { TIER_LABEL, type PlanTier } from '@/lib/planTier';

const PULSE_SEEN_KEY = 'lavamesh_plan_pulse_seen';

export default function Sidebar({ onClose, planTier = 'community', isPro = false, controlHost = 'api.lavamesh.com' }: { onClose?: () => void; planTier?: PlanTier; isPro?: boolean; controlHost?: string }) {
  const pathname = usePathname();
  const [showPlanModal, setShowPlanModal] = useState(false);
  // Pulse a few times to catch the eye on a brand-new session, then settle
  // into a calmer, still-premium (but static) look — an upgrade nudge that
  // never stops moving reads as an ad, not a feature of the product.
  const [pulsing, setPulsing] = useState(false);
  useEffect(() => {
    if (isPro) return;
    if (typeof window === 'undefined' || sessionStorage.getItem(PULSE_SEEN_KEY)) return;
    sessionStorage.setItem(PULSE_SEEN_KEY, '1');
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 3600 * 3); // ~3 breathing cycles
    return () => clearTimeout(t);
  }, [isPro]);

  return (
    <aside className="w-[220px] flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, rgba(255,115,0,0.05) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.3) 100%)', borderRight: '1px solid var(--border-1)', flexShrink: 0 }}>

      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} maxWidth={420} labelledBy="plan-modal-title">
        {isPro ? (
          <div className="relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-0 right-0 btn btn-ghost p-1.5 rounded-[8px]"
              style={{ border: 'none', color: 'var(--text-3)' }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <Badge variant="green" dot className="mb-2.5">{TIER_LABEL[planTier]} plan</Badge>
            <h3 id="plan-modal-title" className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>You&apos;re all set</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>Thanks for supporting LavaMesh — every Pro feature is unlocked on this account.</p>
          </div>
        ) : (
          <div id="plan-modal-title">
            <ProShowcase onClose={() => setShowPlanModal(false)} />
          </div>
        )}
      </Modal>

      {/* Logo + BETA badge */}
      <Link href="/" className="h-[56px] flex items-center justify-between px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-1)', textDecoration: 'none' }}>
        <div className="flex items-center min-w-0">
          <IconChip size={28} className="mr-2.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </IconChip>
          <span className="font-semibold text-[14px] tracking-tight truncate" style={{ color: 'var(--text-1)' }}>LavaMesh</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-1.5 flex-shrink-0" style={{ color: '#ff7300', background: 'rgba(255,115,0,0.15)', letterSpacing: '0.05em' }}>BETA</span>
        </div>
        <span className="status-dot online flex-shrink-0" title="Network Healthy" />
      </Link>

      {/* Nav sections */}
      <nav className="flex-1 px-3 pt-4 space-y-4 overflow-y-auto pb-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5" style={{ color: 'var(--text-4)' }}>{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={onClose} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <span style={{ color: isActive ? 'var(--orange)' : 'var(--text-4)' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2.5" style={{ borderTop: '1px solid var(--border-1)' }}>
        {/* Bigger, bubble-shaped upgrade nudge — this is the one thing in the
            sidebar we actually want people to click, so it gets more size,
            rounder corners, an icon, a benefit line, and a slow breathing
            glow instead of reading as just another quiet nav-adjacent pill. */}
        <button
          onClick={() => setShowPlanModal(true)}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[18px] text-left transition-all ${pulsing ? 'animate-pulse-orange-soft' : ''}`}
          style={{
            background: isPro
              ? 'var(--green-soft)'
              : 'linear-gradient(135deg, rgba(255,115,0,0.18), rgba(255,115,0,0.05))',
            border: `1px solid ${isPro ? 'rgba(61,220,132,0.22)' : 'rgba(255,115,0,0.32)'}`,
            // Settled (post-pulse) state keeps a quiet resting glow — same
            // language as the BETA badge / "+ Add" affordance — instead of
            // going fully flat, so it still reads as "special" without moving.
            boxShadow: !isPro && !pulsing ? '0 0 0 1px rgba(255,115,0,0.08), 0 4px 16px rgba(255,115,0,0.12)' : 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { if (!isPro) { e.currentTarget.style.transform = 'translateY(-1px) scale(1.015)'; e.currentTarget.style.borderColor = 'rgba(255,115,0,0.5)'; } }}
          onMouseLeave={e => { if (!isPro) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,115,0,0.32)'; } }}
        >
          <IconChip
            size={34}
            radius={12}
            glow={!isPro}
            style={isPro ? { background: 'var(--green-soft)', border: '1px solid rgba(61,220,132,0.3)', color: 'var(--green)', boxShadow: 'none' } : undefined}
          >
            {isPro ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.6 4.9L18.5 8l-4.9 1.6L12 14.5l-1.6-4.9L5.5 8l4.9-1.6z"/><path d="M19 15l.9 2.7L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.8z"/></svg>
            )}
          </IconChip>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold leading-none" style={{ color: isPro ? 'var(--green)' : 'var(--orange)' }}>{TIER_LABEL[planTier]} plan</p>
            <p className="text-[10.5px] mt-1 truncate" style={{ color: 'var(--text-4)' }}>
              {isPro ? 'Every feature unlocked' : 'Unlock unlimited seats →'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <IconChip size={28} glow={false} className="text-[11px] font-bold">
            N
          </IconChip>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>{controlHost}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-4)' }}>Connected</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center w-7 h-7 rounded-[6px] flex-shrink-0 transition-all"
            style={{ color: 'var(--text-4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.background = 'transparent'; }}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
