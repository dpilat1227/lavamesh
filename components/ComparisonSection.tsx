const rows = [
  { feature: 'Pricing',        lava: '$19 flat / $149 lifetime', tail: '$6–18 per user/mo',  head: 'Free (DIY)' },
  { feature: 'Per-seat fees',  lava: 'Never',                    tail: 'Always',              head: 'Never',    tailBad: true },
  { feature: 'Web UI',         lava: 'Beautiful dashboard',      tail: 'Basic',               head: 'None',     headBad: true },
  { feature: 'Self-hosted',    lava: 'Full control',             tail: 'Cloud only',          head: 'Full control', tailBad: true },
  { feature: 'Key management', lava: 'Dashboard',                tail: 'Dashboard',           head: 'CLI only', headBad: true },
  { feature: 'ACL editor',     lava: 'Visual + HuJSON',          tail: 'Visual',              head: 'File edit only', headBad: true },
  { feature: 'Audit log',      lava: 'Pro tier',                 tail: 'Teams+ only',         head: 'None',     headBad: true },
  { feature: 'Open protocol',  lava: 'WireGuard',                tail: 'Proprietary DERP',    head: 'WireGuard', tailBad: true },
  { feature: 'Open source',    lava: 'Yes',                      tail: 'No',                  head: 'Yes',      tailBad: true },
  { feature: '50-device fleet',lava: '$19/mo',                   tail: '$300–900/mo',         head: 'CLI grind', tailBad: true, headBad: true },
];

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.6)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ComparisonSection() {
  return (
    <section style={{ padding: '0 24px 120px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,90,0,0.8)' }}>
            Why LavaMesh
          </p>
          <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em', color: 'white' }}>
            The math is obvious.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Tailscale charges per seat. A 50-device homelab costs $300–900/month. Raw Headscale is free — but you're the IT department.
          </p>
        </div>

        {/* Table */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#080808' }}>
          {/* Column headers */}
          <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.2fr 1.2fr', padding: '0 0 0 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '20px 24px' }} />
            {/* LavaMesh header — highlighted */}
            <div style={{ padding: '20px 20px', background: 'rgba(255,90,0,0.04)', borderLeft: '1px solid rgba(255,90,0,0.15)', borderRight: '1px solid rgba(255,90,0,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-[5px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,90,0,0.3)' }}>
                  <svg className="w-2.5 h-2.5" style={{ color: '#FF5A00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <span className="text-[13px] font-bold" style={{ color: '#FF5A00' }}>LavaMesh</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,90,0,0.15)', color: '#FF5A00' }}>PRO</span>
              </div>
            </div>
            <div style={{ padding: '20px 20px' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Tailscale</span>
            </div>
            <div style={{ padding: '20px 20px' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Raw Headscale</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className="comparison-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.4fr 1.2fr 1.2fr',
                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {/* Feature label */}
              <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
                <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{row.feature}</span>
              </div>

              {/* LavaMesh value */}
              <div style={{ padding: '16px 20px', background: 'rgba(255,90,0,0.02)', borderLeft: '1px solid rgba(255,90,0,0.12)', borderRight: '1px solid rgba(255,90,0,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check />
                <span className="text-[13px] font-medium" style={{ color: '#FF5A00' }}>{row.lava}</span>
              </div>

              {/* Tailscale value */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.tailBad ? <Cross /> : <Check />}
                <span className="text-[13px]" style={{ color: row.tailBad ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)' }}>{row.tail}</span>
              </div>

              {/* Headscale value */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.headBad ? <Cross /> : <Check />}
                <span className="text-[13px]" style={{ color: row.headBad ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)' }}>{row.head}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="text-center mt-8">
          <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            50 devices on Tailscale Business = <span style={{ color: '#f87171', fontWeight: 700 }}>$450/month</span>
            {' '}→ LavaMesh Pro = <span style={{ color: '#34d399', fontWeight: 600 }}>$19/month flat</span>
          </p>
        </div>
      </div>
    </section>
  );
}
