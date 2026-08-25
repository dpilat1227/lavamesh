const testimonials = [
  {
    quote: "Honestly I just wanted something that didn't charge per seat. I've got 30+ raspberry pis and vps instances. LavaMesh works perfectly and the UI is genuinely better than the alternatives.",
    name: "Alex",
    role: "Homelabber",
    avatar: "A",
  },
  {
    quote: "Set up the control plane in about 5 mins on a $5 DigitalOcean droplet. The magic dns just worked instantly. Way less headache than manually configuring wireguard tunnels.",
    name: "James T.",
    role: "SysAdmin",
    avatar: "J",
  },
  {
    quote: "I tried Headscale natively first but quickly realized managing ACLs in raw json files is a huge pain. The visual editor here is exactly what I needed.",
    name: "Elena M.",
    role: "Backend Engineer",
    avatar: "E",
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
            <div key={s.label} className="flex items-center gap-3 px-5 py-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[15px] font-bold" style={{ color: s.color }}>{s.val}</span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 24px' }}>
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#FF5A00" style={{ opacity: 0.9 }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14px] leading-relaxed flex-1 mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(255,90,0,0.15)', color: '#FF5A00', border: '1px solid rgba(255,90,0,0.2)' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{t.name}</div>
                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.role}</div>
                </div>
                <div className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Beta tester
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
