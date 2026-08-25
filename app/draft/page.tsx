'use client';
import Link from 'next/link';
import HeroAnimation from '@/components/HeroAnimation';

/* ─── Draft: Left-aligned hero test ─────────────────────────────────────────
   Testing left-aligned Lambda-style hero layout vs the centered main page.
   This is intentionally minimal — just the hero for comparison.
   ─────────────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-14"
      style={{ background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,90,0,0.35)' }}>
          <svg className="w-3.5 h-3.5" style={{ color: '#FF5A00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <span style={{ fontWeight: 500, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>LavaMesh</span>
      </Link>
      <div className="flex items-center gap-5">
        {['Features', 'How it works', 'Pricing'].map(l => (
          <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>{l}</a>
        ))}
        <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, padding: '7px 18px', borderRadius: 8, background: '#FF5A00', color: 'white', textDecoration: 'none' }}>Dashboard →</Link>
      </div>
    </nav>
  );
}

export default function DraftHero() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,90,0,0.06) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <Nav />

      {/* ━━━ HERO: Split layout (text left, animation right) ━━━━━━━━━━━━━ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Left — Text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '140px 64px 80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginBottom: 32, alignSelf: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5A00' }} /> NOW IN BETA
          </div>

          <h1 style={{ fontSize: 'clamp(56px, 7vw, 100px)', fontWeight: 700, letterSpacing: '-0.06em', lineHeight: 0.9, marginBottom: 40 }}>
            Private<br />mesh<br />
            <span style={{ background: 'linear-gradient(135deg, #FF5A00, #FF8A00, #FFC857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>networking.</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.35)', maxWidth: 420, marginBottom: 40, letterSpacing: '-0.01em' }}>
            A self-hosted WireGuard mesh with a beautiful dashboard. No per-seat pricing. No vendor lock-in. Complete control.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: '#FF5A00', color: 'white', textDecoration: 'none', boxShadow: '0 0 40px rgba(255,90,0,0.25)' }}>
              Deploy Free <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>Free to self-host · Pro from $19/mo</p>
        </div>

        {/* Right — Node animation (no background fill) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 32px 80px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(255,90,0,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ width: '100%', maxWidth: 560, height: 440, position: 'relative', zIndex: 1 }}>
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Minimal footer for context */}
      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      <div style={{ padding: '40px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          ↑ This is a draft hero layout test. Compare with <a href="/" style={{ color: '#FF5A00', textDecoration: 'none' }}>localhost:3000/</a> (centered hero).
        </p>
      </div>
    </div>
  );
}
