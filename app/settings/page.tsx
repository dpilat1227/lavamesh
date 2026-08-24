import { getRoutes, getDnsConfig, getNameservers } from '@/lib/headscale';

async function fetchSettingsData() {
  const [routes, dns, ns] = await Promise.allSettled([getRoutes(), getDnsConfig(), getNameservers()]);
  return {
    routes: routes.status === 'fulfilled' ? routes.value : [],
    dns: dns.status === 'fulfilled' ? dns.value : null,
    ns: ns.status === 'fulfilled' ? ns.value : null,
  };
}

function InfoRow({ label, value, mono = false, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="text-[13px] font-medium" style={{ color: accent || 'var(--text-2)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h2>
      {description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>{description}</p>}
    </div>
  );
}

export default async function SettingsPage() {
  const { routes, dns, ns } = await fetchSettingsData();

  const exitRoutes = routes.filter((r: any) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0');
  const baseDomain: string = dns?.domains?.[0] || dns?.baseDomain || '';
  const nameservers: string[] = ns?.dnsConfig?.nameservers || ns?.nameservers || [];
  const magicDnsOn = nameservers.length > 0 || !!baseDomain;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Settings</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Network configuration and status</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ minHeight: 0 }}>
        <div className="max-w-[600px] space-y-6">

          {/* ── Exit Node ─────────────────────────────────────────── */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--purple), transparent)' }} />
            <SectionHeader title="Exit Node" description="Route all client traffic through a designated node" />

            {exitRoutes.length === 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge badge-ghost">Not configured</span>
                </div>
                <p className="text-[12px] mb-3" style={{ color: 'var(--text-3)' }}>Run this on your DigitalOcean droplet to advertise it as an exit node:</p>
                <div className="px-4 py-3 rounded-[10px] overflow-x-auto" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)' }}>
                  <pre className="text-[11.5px] leading-relaxed" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{`sudo tailscale up \\
  --login-server=https://api.lavamesh.com \\
  --advertise-exit-node \\
  --accept-routes`}</pre>
                </div>
                <p className="text-[11px] mt-3" style={{ color: 'var(--text-4)' }}>Then approve it in the <strong style={{ color: 'var(--text-3)' }}>Routes</strong> tab.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exitRoutes.map((r: any) => {
                  const name = r.machine?.givenName || r.node?.givenName || 'Unknown';
                  const ip = r.machine?.ipAddresses?.[0] || r.node?.ipAddresses?.[0] || '';
                  return (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-[12px]"
                      style={{ background: r.enabled ? 'rgba(52,211,153,0.04)' : 'var(--surface-3)', border: `1px solid ${r.enabled ? 'rgba(52,211,153,0.12)' : 'var(--border-2)'}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: 'var(--purple-soft)', border: '1px solid rgba(167,139,250,0.2)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--purple)' }}>
                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{ip} · {r.prefix}</p>
                        </div>
                      </div>
                      {r.enabled ? (
                        <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Active</span>
                      ) : (
                        <span className="badge badge-amber">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── MagicDNS ──────────────────────────────────────────── */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '60ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${magicDnsOn ? 'var(--green)' : 'var(--text-4)'}, transparent)` }} />
            <div className="flex items-start justify-between mb-4">
              <SectionHeader title="MagicDNS" description="Automatic hostname resolution across the mesh" />
              <span className={`badge ${magicDnsOn ? 'badge-green' : 'badge-ghost'} mt-0.5`}>
                {magicDnsOn ? <><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Enabled</> : 'Disabled'}
              </span>
            </div>

            <div>
              <InfoRow label="Base Domain" value={baseDomain || 'Not configured'} mono={!!baseDomain} accent={baseDomain ? 'var(--text-2)' : 'var(--text-4)'} />
              <div className="py-3">
                <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Nameservers</span>
                <div className="mt-2 space-y-1">
                  {nameservers.length > 0 ? nameservers.map((ns: string) => (
                    <div key={ns} className="px-3 py-1.5 rounded-[8px] text-[12px] font-mono" style={{ background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border-1)', fontFamily: 'var(--font-mono)' }}>{ns}</div>
                  )) : (
                    <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>No nameservers configured</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── API Config ────────────────────────────────────────── */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '120ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
            <SectionHeader title="API Configuration" description="Headscale control plane connection" />
            <div>
              <InfoRow label="Control Server" value={process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com'} mono accent="var(--text-2)" />
              <InfoRow label="API Key" value={'•'.repeat(24)} />
              <InfoRow label="Headscale Version" value="v0.22.3" />
            </div>
          </div>

          {/* ── Access Control ────────────────────────────────────── */}
          <div className="animate-fade-in-up card p-6" style={{ animationDelay: '180ms' }}>
            <div className="flex items-start justify-between mb-4">
              <SectionHeader title="Access Control Lists" description="Manage traffic rules via HuJSON policy" />
              <button disabled className="btn btn-ghost text-[12px] opacity-40 cursor-not-allowed">Edit ACLs</button>
            </div>
            <div className="px-4 py-3 rounded-[10px] overflow-x-auto" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-2)' }}>
              <pre className="text-[11.5px] leading-relaxed" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{`// Default Policy — Allow All
{
  "acls": [
    { "action": "accept", "src": ["*"], "dst": ["*:*"] }
  ]
}`}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
