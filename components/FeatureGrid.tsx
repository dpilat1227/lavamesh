'use client';

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    color: '#ff7300',
    title: 'Zero-Trust Mesh',
    desc: 'Every connection is encrypted end-to-end using WireGuard. No central relay, no cleartext — ever.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    color: '#a78bfa',
    title: 'Exit Nodes',
    desc: 'Route your traffic through any node you own. Replace your VPN — run it on a $4 DigitalOcean droplet.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    color: '#3ddc84',
    title: 'One-Line Deploy',
    desc: 'Generate a token, run one curl command. Any Linux machine joins your private mesh in under 30 seconds.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>
    ),
    color: '#fbbf24',
    title: 'Key Management',
    desc: 'Generate, audit, and revoke pre-auth keys. Control exactly who joins with reusable or single-use tokens.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
    color: '#60a5fa',
    title: 'Fully Self-Hosted',
    desc: 'Your Headscale server, your data, your rules. No per-seat fees, no vendor lock-in, no data leaving your infrastructure.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
    color: '#f472b6',
    title: 'Subnet Routing',
    desc: 'Expose entire private subnets across your mesh. Access 192.168.x.x ranges from anywhere, securely.',
  },
];

export default function FeatureGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      {features.map((f, i) => (
        <div
          key={f.title}
          className="animate-fade-in-up lift-on-hover"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '28px 28px',
            animationDelay: `${i * 60}ms`,
            transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out)',
            cursor: 'default',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`;
            (e.currentTarget as HTMLElement).style.background = `${f.color}06`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
          }}
        >
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4"
            style={{ background: `${f.color}14`, border: `1px solid ${f.color}28`, color: f.color }}>
            {f.icon}
          </div>
          <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'white', letterSpacing: '-0.02em' }}>{f.title}</h3>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
