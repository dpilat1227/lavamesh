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
  { val: 'Flat rate', label: 'Pricing model', color: '#FF5A00' },
  { val: 'WireGuard', label: 'Encryption', color: '#60a5fa' },
  { val: 'Self-hosted', label: 'Data sovereignty', color: '#34d399' },
  { val: 'Open source', label: 'No lock-in', color: '#a78bfa' },
];

export default function SocialProof() {
  return (
    <section style={{ padding: '0 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,90,0,0.8)' }}>
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
                style={{ background: 'rgba(255,90,0,0.1)', border: '1px solid rgba(255,90,0,0.2)', color: '#FF5A00' }}>
                {r.icon}
              </div>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'white', letterSpacing: '-0.01em' }}>{r.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Honest framing instead of fabricated reviews — this is genuinely early software */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            LavaMesh is in public beta — no case studies yet, just a working product and an open repo.
          </span>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium" style={{ color: '#FF5A00', textDecoration: 'none' }}>
            See for yourself →
          </a>
        </div>
      </div>
    </section>
  );
}
