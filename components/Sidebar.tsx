'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { navSections } from './navConfig';
import { IconChip } from './ui';

export default function Sidebar({ onClose, controlHost = 'api.lavamesh.com', demo = false }: { onClose?: () => void; controlHost?: string; demo?: boolean }) {
  const pathname = usePathname();
  const hrefFor = (path: string) => (demo ? (path === '/dashboard' ? '/demo' : `/demo${path}`) : path);

  // Real control-plane status instead of a hardcoded "Connected". Starts as
  // unknown so we never claim health we haven't verified.
  const [health, setHealth] = useState<'unknown' | 'ok' | 'down'>(demo ? 'ok' : 'unknown');
  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/headscale-health', { cache: 'no-store' });
        const body = await res.json();
        if (!cancelled) setHealth(body?.ok ? 'ok' : 'down');
      } catch {
        if (!cancelled) setHealth('down');
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [demo]);

  const healthLabel = demo ? 'Sample data' : health === 'ok' ? 'Connected' : health === 'down' ? 'Unreachable' : 'Checking…';
  const healthColor = health === 'ok' ? 'var(--green)' : health === 'down' ? 'var(--red)' : 'var(--text-4)';

  return (
    <aside className="w-[220px] flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, rgba(255,115,0,0.05) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.3) 100%)', borderRight: '1px solid var(--border-1)', flexShrink: 0 }}>

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
                const href = hrefFor(item.path);
                const isActive = pathname === href;
                return (
                  <Link key={item.path} href={href} onClick={onClose} className={`nav-item ${isActive ? 'active' : ''}`}>
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
          <IconChip size={28} glow={false} className="text-[11px] font-bold">
            N
          </IconChip>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>{controlHost}</p>
            <p className="text-[10px] truncate flex items-center gap-1.5" style={{ color: healthColor }}>
              {health !== 'unknown' && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: healthColor }} />
              )}
              {healthLabel}
            </p>
          </div>
          <button
            onClick={() => { if (demo) window.location.href = '/login'; else signOut({ callbackUrl: '/login' }); }}
            className="flex items-center justify-center w-7 h-7 rounded-[6px] flex-shrink-0 transition-all"
            style={{ color: 'var(--text-4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.background = 'transparent'; }}
            title={demo ? 'Leave demo' : 'Sign out'}
            aria-label={demo ? 'Leave demo' : 'Sign out'}
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
