'use client';
import { useState } from 'react';
import Link from 'next/link';

/** Shared marketing-site nav — used by the landing page and every /blog page,
 * so a nav change (like adding Blog) never has to happen in two places. */
export default function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      <style>{`
        .nav-gh-link:hover { color: rgba(255,255,255,0.85) !important; }
        .nav-desktop-links { display: flex; }
        .nav-mobile-btn { display: none; }
        @media (max-width: 640px) {
          .nav-desktop-links { display: none; }
          .nav-mobile-btn { display: flex; }
        }
      `}</style>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.35)', boxShadow: '0 0 16px rgba(255,115,0,0.25)' }}>
            <svg className="w-4 h-4" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <span className="font-semibold text-[17px] tracking-tight" style={{ color: 'white', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>LavaMesh</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ color: '#ff7300', background: 'rgba(255,115,0,0.15)', letterSpacing: '0.05em' }}>BETA</span>
        </Link>
        {/* Desktop links */}
        <div className="nav-desktop-links items-center">
          <div className="flex items-center gap-8">
            <Link href="/#features" className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>Features</Link>
            <Link href="/#pricing" className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>Pricing</Link>
            <Link href="/blog" className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>Blog</Link>
            <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
              className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>GitHub</a>
          </div>
          <Link href="/dashboard" className="btn btn-primary ml-7" style={{ padding: '8px 18px', borderRadius: '10px', fontSize: 13 }}>Dashboard →</Link>
        </div>
        {/* Mobile hamburger */}
        <button className="nav-mobile-btn items-center justify-center w-9 h-9 rounded-[8px]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </nav>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 z-40 flex flex-col gap-1 p-4"
          style={{ top: 56, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/#features" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>Features</Link>
          <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>Pricing</Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>Blog</Link>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>GitHub ↗</a>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-bold text-center" style={{ background: 'var(--orange-cta)', color: 'white' }}>Open Dashboard →</Link>
        </div>
      )}
    </>
  );
}
