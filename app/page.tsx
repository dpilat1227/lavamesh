'use client';
import { useState } from 'react';
import Link from 'next/link';
import HeroAnimation from '@/components/HeroAnimation';
import TerminalBlock from '@/components/TerminalBlock';
import FeatureGrid from '@/components/FeatureGrid';
import PricingSection from '@/components/PricingSection';
import WaitlistForm from '@/components/WaitlistForm';
import ComparisonSection from '@/components/ComparisonSection';
import SocialProof from '@/components/SocialProof';
import FounderSection from '@/components/FounderSection';

// ── Nav ────────────────────────────────────────────────────────────────────────
function Nav() {
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
            <a href="#features" className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>Features</a>
            <a href="#pricing" className="text-[14px] font-medium nav-gh-link transition-colors" style={{ color: 'var(--text-accent)' }}>Pricing</a>
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
          <a href="#features" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>Pricing</a>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
            className="px-4 py-3 rounded-[10px] text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}>GitHub ↗</a>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-[10px] text-[14px] font-bold text-center" style={{ background: 'var(--orange-cta)', color: 'white' }}>Open Dashboard →</Link>
        </div>
      )}
    </>
  );
}

// ── Dashboard mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  const nodes = [
    { name: 'drews-macbook-air-m1', ip: '100.64.0.1', online: true, user: 'admin' },
    { name: 'london-exit-node', ip: '100.64.0.2', online: true, user: 'admin' },
    { name: 'raspberry-pi-4', ip: '100.64.0.3', online: false, user: 'home' },
    { name: 'staging-server', ip: '100.64.0.4', online: true, user: 'admin' },
  ];
  return (
    <div className="relative rounded-[20px] overflow-hidden"
      style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <div className="text-[14px] font-semibold" style={{ color: 'white' }}>Node Fleet</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Updated just now · auto-refreshes every 30s</div>
        </div>
        <div className="px-3 py-1.5 rounded-[8px] text-[11px] font-medium" style={{ background: 'var(--orange-cta)', color: 'white' }}>+ New Provision Token</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4">
        {[
          { label: 'TOTAL NODES', val: '4', color: 'white' },
          { label: 'ONLINE', val: '3', color: '#3ddc84' },
          { label: 'OFFLINE', val: '1', color: 'rgba(255,255,255,0.3)' },
          { label: 'UPTIME', val: '99.9%', color: '#ff7300' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-[9px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>{s.label}</div>
            <div className="text-[22px] font-bold tracking-tight leading-none" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="px-6 pb-5">
        <div className="rounded-[12px] overflow-hidden overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ minWidth: 500 }}>
            <div className="grid px-4 py-2.5" style={{ gridTemplateColumns: '1fr 110px 90px 80px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            {['NODE', 'MESH IP', 'LAST SEEN', 'STATUS'].map(h => (
              <span key={h} className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>
          {nodes.map((node, i) => (
            <div key={node.name} className="grid items-center px-4 py-3"
              style={{ gridTemplateColumns: '1fr 110px 90px 80px', borderBottom: i < nodes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-[5px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <div>
                  <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{node.name}</div>
                  <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{node.user}</div>
                </div>
              </div>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{node.ip}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Just now</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium w-fit"
                style={{ background: node.online ? 'rgba(61,220,132,0.1)' : 'rgba(255,255,255,0.04)', color: node.online ? '#3ddc84' : 'rgba(255,255,255,0.3)', border: `1px solid ${node.online ? 'rgba(61,220,132,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                <span className="w-1 h-1 rounded-full" style={{ background: node.online ? '#3ddc84' : 'rgba(255,255,255,0.2)' }}></span>
                {node.online ? 'Online' : 'Offline'}
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const steps = [
  { n: '01', title: 'Deploy Headscale', desc: 'Spin up Headscale on any Linux server. One binary, one config file, five minutes.' },
  { n: '02', title: 'Open the Dashboard', desc: 'Connect LavaMesh to your Headscale instance. All your nodes appear instantly.' },
  { n: '03', title: 'Provision a Node', desc: 'Generate a token, run one curl command. Any machine joins your mesh in seconds.' },
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="landing-page" style={{ background: '#000', minHeight: '100vh', color: 'white', fontFamily: 'var(--font-sans)', position: 'relative' }}>
      {/* Subtle star field */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 42%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 65%, rgba(255,255,255,0.05) 0%, transparent 100%),
          radial-gradient(1px 1px at 35% 78%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 60% 72%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 80% 38%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 5% 88%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 48% 92%, rgba(255,255,255,0.05) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 75%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 18% 48%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 73% 58%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 33% 22%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.05) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 55%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 63% 30%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 8% 40%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 95% 48%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 28% 85%, rgba(255,255,255,0.05) 0%, transparent 100%),
          radial-gradient(1px 1px at 52% 15%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 82%, rgba(255,255,255,0.06) 0%, transparent 100%)
        `,
      }} />
      <Nav />

      {/* ── HERO — split layout: pitch and proof side by side ────────────────── */}
      <style>{`
        .hero-split { display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: center; }
        @media (max-width: 940px) {
          .hero-split { grid-template-columns: 1fr; }
          .hero-visual { min-height: 320px; padding-top: 0 !important; }
        }
      `}</style>
      <section className="hero-split" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Grid + glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <svg className="w-full h-full" style={{ position: 'absolute', opacity: 0.025 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 70% at 30% 50%, transparent 0%, #000 100%)' }} />
          <div style={{ position: 'absolute', top: '0%', right: '-8%', width: 750, height: 650, background: 'radial-gradient(circle, rgba(255,115,0,0.10) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
        </div>

        {/* Left — pitch */}
        <div className="relative z-10 flex flex-col justify-center px-6 md:pl-16 lg:pl-20 md:pr-10" style={{ paddingTop: 96, paddingBottom: 64 }}>
          {/* Eyebrow pill */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 self-start"
            style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#ff7300' }}></span>
            <span className="text-[12px] font-medium" style={{ color: '#ff7300' }}>Self-hosted WireGuard mesh — zero per-seat fees</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up font-bold mb-6"
            style={{ fontSize: 'clamp(42px, 4.8vw, 74px)', letterSpacing: '-0.035em', lineHeight: 1.03, animationDelay: '80ms' }}>
            <span style={{ color: 'white' }}>Private networking.</span><br />
            <span style={{ background: 'linear-gradient(135deg, #ff7300 0%, #FF8A00 60%, rgba(255,180,50,0.9) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No compromise.</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-in-up text-[17px] leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 460, letterSpacing: '-0.01em', animationDelay: '160ms' }}>
            A self-hosted mesh network with a beautiful dashboard. Powered by Headscale and WireGuard. Zero per-seat fees. Total control.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up flex flex-col gap-4" style={{ animationDelay: '240ms' }}>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#pricing" className="btn btn-primary"
                style={{ padding: '13px 28px', borderRadius: '12px', fontSize: 15, boxShadow: '0 0 30px rgba(255,115,0,0.3)' }}>
                Deploy Free →
              </a>
              <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost" style={{ padding: '13px 28px', borderRadius: '12px', fontSize: 15 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </a>
            </div>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Free to self-host · Pro license from $19/mo</p>
          </div>
        </div>

        {/* Right — proof: the live mesh, right next to the claim */}
        <div className="hero-visual relative z-10 flex items-center justify-center px-6 md:pr-16 lg:pr-20" style={{ paddingTop: 96, paddingBottom: 64 }}>
          <div className="animate-fade-in w-full" style={{ maxWidth: 560, height: 480, animationDelay: '400ms', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, #000 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <HeroAnimation />
          </div>
        </div>
      </section>


      {/* ── COMPARISON ────────────────────────────────────────────────────────── */}
      <ComparisonSection />

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>Built for control</p>
            <h2 className="font-bold tracking-tight" style={{ fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-0.03em', color: 'white' }}>
              Everything you need.<br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Nothing you don&apos;t.</span>
            </h2>
          </div>
          <FeatureGrid />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>How it works</p>
            <h2 className="font-bold tracking-tight" style={{ fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-0.03em', color: 'white' }}>
              Online in three steps.
            </h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ background: '#000', padding: '40px 36px', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div className="step-divider" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 1, height: '40%', background: 'rgba(255,255,255,0.05)' }} />
                )}
                <div className="text-[11px] font-semibold mb-4" style={{ color: 'rgba(255,115,0,0.5)', letterSpacing: '0.08em' }}>{step.n}</div>
                <h3 className="text-[20px] font-semibold mb-3" style={{ color: 'white', letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TERMINAL ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>One command</p>
            <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.03em', color: 'white' }}>
              Join the mesh instantly.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Generate a token from the dashboard. Paste one line. Done.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(61,220,132,0.06) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <TerminalBlock />
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>The dashboard</p>
            <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.03em', color: 'white' }}>
              Beautiful by default.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>
              A clean, fast admin panel for your entire mesh. No setup beyond connecting to your Headscale instance.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            {/* Ambient glow behind mockup */}
            <div style={{ position: 'absolute', inset: '-60px', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,115,0,0.12) 0%, rgba(255,115,0,0.04) 40%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────────────────── */}
      <SocialProof />

      {/* ── FOUNDER BIO ───────────────────────────────────────────────────────── */}
      <FounderSection />

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── WAITLIST ──────────────────────────────────────────────────────────── */}
      <WaitlistForm />

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[6px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.3)' }}>
              <svg className="w-2.5 h-2.5" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>LavaMesh</span>
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>· Headscale · WireGuard · Next.js · Vercel</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Login</Link>
            <a href="https://headscale.net" target="_blank" rel="noopener noreferrer" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Headscale</a>
            <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
