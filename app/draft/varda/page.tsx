'use client';
import Link from 'next/link';

/* ─── Draft Landing B: Varda Space-inspired with lava backgrounds ────────────
   Full-bleed cinematic hero · Lava photography · Bold centered text
   4 hero variants stacked for comparison
   ─────────────────────────────────────────────────────────────────────────── */

const lavaImages = ['/lava-1.jpg', '/lava-2.jpg', '/lava-3.jpg', '/lava-4.jpg'];

function HeroVariant({ img, index }: { img: string; index: number }) {
  return (
    <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Heavy dark overlay — much stronger than before */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* Left-side darkening gradient for text area */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
      }} />

      {/* Content — left-aligned, bottom-anchored like Varda */}
      <div style={{ position: 'relative', zIndex: 3, padding: '0 72px 100px', maxWidth: 800 }}>
        {/* Variant label */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '4px 10px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'inline-block', marginBottom: 24 }}>
          Variant {index + 1}
        </div>

        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', marginBottom: 32, marginLeft: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff7300', boxShadow: '0 0 12px rgba(255,115,0,0.6)' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>NOW IN BETA</span>
        </div>

        {/* Headline — large, left-aligned */}
        <h1 style={{
          fontSize: 'clamp(56px, 9vw, 110px)',
          fontWeight: 700,
          letterSpacing: '-0.05em',
          lineHeight: 0.92,
          color: 'white',
          marginBottom: 24,
          textShadow: '0 4px 60px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)',
        }}>
          Private mesh<br />
          <span style={{
            background: 'linear-gradient(135deg, #ff7300 0%, #FF8A00 50%, #FFB84D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 4px 30px rgba(255,115,0,0.5))',
          }}>networking.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)',
          maxWidth: 480, marginBottom: 40,
          textShadow: '0 2px 30px rgba(0,0,0,0.8)',
        }}>
          A self-hosted WireGuard mesh with a beautiful dashboard. No per-seat pricing. Total control over your network.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 600,
            background: 'var(--orange-cta)', color: 'white', textDecoration: 'none',
            boxShadow: '0 0 50px rgba(255,115,0,0.35), 0 4px 20px rgba(0,0,0,0.3)',
          }}>
            Deploy Free <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 500,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
            backdropFilter: 'blur(12px)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 20, textShadow: '0 1px 10px rgba(0,0,0,0.8)' }}>
          Free to self-host · Pro from $19/mo
        </p>
      </div>

      {/* Bottom gradient fade to black */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 4, background: 'linear-gradient(transparent, #050505)', pointerEvents: 'none' }} />

      {/* Scroll indicator (first variant only) */}
      {index === 0 && (
        <div style={{ position: 'absolute', bottom: 30, right: 72, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', textShadow: '0 1px 10px rgba(0,0,0,0.8)' }}>Scroll for more variants</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      )}
    </section>
  );
}

// ── Nav (minimal, glassmorphic) ──────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-14"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.35)' }}>
          <svg className="w-3.5 h-3.5" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <span style={{ fontWeight: 500, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>LavaMesh</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, padding: '7px 18px', borderRadius: 8, background: 'var(--orange-cta)', color: 'white', textDecoration: 'none' }}>Dashboard →</Link>
      </div>
    </nav>
  );
}

export default function DraftVarda() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: 'white' }}>
      <Nav />

      {/* 4 hero variants — scroll through to compare backgrounds */}
      {lavaImages.map((img, i) => (
        <HeroVariant key={i} img={img} index={i} />
      ))}

      {/* Separator note */}
      <section style={{ padding: '80px 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', maxWidth: 500, margin: '0 auto' }}>
          ↑ Scroll up to compare all four lava backgrounds. Each hero variant uses the same layout with a different image. Pick your favorite.
        </p>
      </section>
    </div>
  );
}
