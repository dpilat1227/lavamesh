'use client';
import { useEffect, useState } from 'react';

// LavaMesh is early — we don't have named customer testimonials yet, and we'd
// rather say that plainly than fabricate quotes from people who don't exist.
// These are the concrete, verifiable reasons people choose this stack instead.
const reasons = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
    ),
    title: "Nothing rented, nothing revoked",
    desc: "Headscale runs on infrastructure you control. No account to get suspended, no company that can raise your price or shut down and take your network with it.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    ),
    title: "Open source, auditable core",
    desc: "The control plane isn't a black box. Read the code, run it air-gapped, fork it if we ever disappear. That's the actual guarantee — not a promise on a pricing page.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
    ),
    title: "Priced like a tool, not a tax",
    desc: "One flat rate covers your entire mesh, whether that's 3 devices or 300. No per-seat math to redo every time you add a machine.",
  },
];

const stats = [
  { val: 'Flat rate', label: 'Pricing model', color: '#ff7300' },
  { val: 'WireGuard', label: 'Encryption', color: '#60a5fa' },
  { val: 'Self-hosted', label: 'Data sovereignty', color: '#3ddc84' },
  { val: 'Open source', label: 'No lock-in', color: '#a78bfa' },
];

export default function SocialProof() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/github-stats')
      .then(r => r.json())
      .then(d => setStars(typeof d.stars === 'number' ? d.stars : null))
      .catch(() => setStars(null));
  }, []);

  return (
    <section style={{ padding: '0 24px clamp(48px, 7vw, 80px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>
            Community
          </p>
          <h2 className="font-bold tracking-tight" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em', color: 'white' }}>
            Built by a homelabber.{' '}
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>For homelabbers.</span>
          </h2>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-3 px-5 py-3 rounded-full lift-on-hover"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[15px] font-bold" style={{ color: s.color }}>{s.val}</span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Why self-hosted — honest reasoning instead of invented reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {reasons.map((r) => (
            <div key={r.title} className="flex flex-col lift-on-hover"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-xl)', padding: '28px 24px' }}>
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,115,0,0.1)', border: '1px solid rgba(255,115,0,0.2)', color: '#ff7300' }}>
                {r.icon}
              </div>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'white', letterSpacing: '-0.01em' }}>{r.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Honest framing instead of fabricated reviews — this is genuinely early software */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            LavaMesh is in public beta — no case studies yet, just a working product and an open repo.
          </span>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium" style={{ color: '#ff7300', textDecoration: 'none' }}>
            See for yourself →
          </a>
        </div>

        {/* Live, verifiable GitHub signal instead of a static claim — updates
            itself as the repo actually earns stars, no copy edits needed. */}
        <div className="mt-8 flex items-center justify-center">
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full lift-on-hover"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.94c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.2 1.18a11 11 0 0 1 5.82 0c2.22-1.5 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.17v3.22c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {stars !== null && stars > 0 ? `${stars.toLocaleString()} stars on GitHub` : 'Star LavaMesh on GitHub'}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
