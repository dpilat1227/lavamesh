import { getRoutes, getDnsConfig, getNameservers, getPolicy } from '@/lib/headscale';
import AclEditor from './AclEditor';

async function fetchSettingsData() {
  const [routes, dns, ns, policy] = await Promise.allSettled([
    getRoutes(), getDnsConfig(), getNameservers(), getPolicy()
  ]);
  return {
    routes: routes.status === 'fulfilled' ? routes.value : [],
    dns: dns.status === 'fulfilled' ? dns.value : null,
    ns: ns.status === 'fulfilled' ? ns.value : null,
    policy: policy.status === 'fulfilled' ? policy.value : null,
  };
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="text-[13px] font-medium" style={{ color: 'var(--text-2)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const { routes, dns, ns, policy } = await fetchSettingsData();

  const exitRoutes = routes.filter((r: any) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0');
  const baseDomain: string = dns?.domains?.[0] || dns?.baseDomain || '';
  const nameservers: string[] = ns?.dnsConfig?.nameservers || ns?.nameservers || [];
  const magicDnsOn = nameservers.length > 0 || !!baseDomain;
  const policyText: string =
    policy?.policy ||
    policy?.acl ||
    (policy != null ? JSON.stringify(policy, null, 2) : '') ||
    `{
  // Default policy — allow all traffic between all nodes
  // Edit and save to restrict access.
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ]
}`;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <header className="flex-shrink-0 flex items-center px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Settings</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Network configuration and access control</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ minHeight: 0 }}>
        <div className="max-w-[640px] space-y-5">

          {/* Exit Node */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--purple), transparent)' }} />
            <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Exit Node</h2>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>Route all client traffic through a designated node</p>
            {exitRoutes.length === 0 ? (
              <div>
                <span className="badge badge-ghost mb-3">Not configured</span>
                <div className="px-4 py-3 rounded-[10px] overflow-x-auto mt-3" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)' }}>
                  <pre className="text-[11.5px] leading-relaxed" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{`sudo tailscale up \\\n  --login-server=https://api.lavamesh.com \\\n  --advertise-exit-node \\\n  --accept-routes`}</pre>
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
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{name}</p>
                        <p className="text-[11px] font-mono" style={{ color: 'var(--text-4)' }}>{ip} · {r.prefix}</p>
                      </div>
                      {r.enabled ? <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Active</span> : <span className="badge badge-amber">Pending</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MagicDNS */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '60ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${magicDnsOn ? 'var(--green)' : 'var(--text-4)'}, transparent)` }} />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>MagicDNS</h2>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Automatic hostname resolution across the mesh</p>
              </div>
              <span className={`badge ${magicDnsOn ? 'badge-green' : 'badge-ghost'}`}>
                {magicDnsOn ? <><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Enabled</> : 'Disabled'}
              </span>
            </div>
            <InfoRow label="Base Domain" value={baseDomain || 'Not configured'} mono={!!baseDomain} />
            <div className="pt-3">
              <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Nameservers</span>
              <div className="mt-2 space-y-1">
                {nameservers.length > 0 ? nameservers.map((ns: string) => (
                  <div key={ns} className="px-3 py-1.5 rounded-[8px] text-[12px]" style={{ background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border-1)', fontFamily: 'var(--font-mono)' }}>{ns}</div>
                )) : <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>No nameservers configured</p>}
              </div>
            </div>
          </div>

          {/* ACL Editor */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '120ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
            <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Access Control Policy</h2>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>HuJSON policy defining which devices can communicate</p>
            <AclEditor initialPolicy={policyText} policyAvailable={!!policy} />
          </div>

          {/* API Config */}
          <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '180ms' }}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--orange), transparent)' }} />
            <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-1)' }}>API Configuration</h2>
            <InfoRow label="Control Server" value={process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com'} mono />
            <InfoRow label="API Key" value={'•'.repeat(24)} />
            <InfoRow label="Headscale Version" value="v0.22.3" />
          </div>

        </div>
      </div>
    </div>
  );
}
