'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { navSections } from './navConfig';

export default function Sidebar({ onClose, onOpenPalette }: { onClose?: () => void; onOpenPalette?: () => void }) {
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);
  useEffect(() => { setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.platform)); }, []);

  return (
    <aside className="w-[220px] flex flex-col min-h-screen" style={{ background: 'rgba(0,0,0,0.3)', borderRight: '1px solid var(--border-1)', flexShrink: 0 }}>

      {/* Logo + health inline */}
      <Link href="/" className="h-[56px] flex items-center justify-between px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-1)', textDecoration: 'none' }}>
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center mr-2.5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,90,0,0.3)', boxShadow: '0 0 14px rgba(255,90,0,0.18)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#FF5A00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <span className="font-semibold text-[14px] tracking-tight" style={{ color: 'var(--text-1)' }}>LavaMesh</span>
        </div>
        <span className="status-dot online" title="Network Healthy" />
      </Link>

      {/* Quick jump / command palette trigger */}
      <div className="px-3 pt-3 flex-shrink-0">
        <button
          onClick={onOpenPalette}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-left transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', color: 'var(--text-4)', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span className="text-[12px] flex-1">Jump to…</span>
          <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-2)', color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
      </div>

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
      <div className="p-3" style={{ borderTop: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,90,0,0.25)', color: 'var(--orange)' }}>
            N
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>api.lavamesh.com</p>
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
