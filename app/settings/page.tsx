import { getRoutes, getDnsConfig, getNameservers } from "@/lib/headscale";

async function fetchSettingsData() {
  const [routes, dns, ns] = await Promise.allSettled([
    getRoutes(),
    getDnsConfig(),
    getNameservers(),
  ]);

  return {
    routes: routes.status === "fulfilled" ? routes.value : [],
    dns: dns.status === "fulfilled" ? dns.value : null,
    ns: ns.status === "fulfilled" ? ns.value : null,
  };
}

export default async function SettingsPage() {
  const { routes, dns, ns } = await fetchSettingsData();

  // Exit nodes advertise 0.0.0.0/0 or ::/0
  const exitNodeRoutes = routes.filter(
    (r: any) => r.prefix === "0.0.0.0/0" || r.prefix === "::/0"
  );

  // MagicDNS info
  const baseDomain: string = dns?.domains?.[0] || dns?.baseDomain || "";
  const nameservers: string[] = ns?.dnsConfig?.nameservers || ns?.nameservers || [];
  const magicDnsEnabled = nameservers.length > 0 || !!baseDomain;

  return (
    <div className="relative h-full flex flex-col px-10">
      <header className="h-20 flex shrink-0 items-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-white/90">Network Settings</h1>
      </header>

      <div className="pb-10 flex-1 max-w-2xl space-y-6">

        {/* ── Exit Node ───────────────────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></span>
                Exit Node
              </h2>
              <p className="text-[12px] text-neutral-500 mt-1">
                Routes all client traffic through a designated mesh node.
              </p>
            </div>
          </div>

          {exitNodeRoutes.length === 0 ? (
            <div className="bg-black/30 rounded-xl border border-white/[0.06] p-5">
              <p className="text-[13px] text-neutral-400 mb-3">No exit nodes advertised yet. On your DigitalOcean droplet, run:</p>
              <pre className="font-mono text-[11px] text-neutral-300 bg-black/60 border border-white/10 rounded-lg p-3 overflow-x-auto leading-relaxed">
{`sudo tailscale up \\
  --login-server=https://api.lavamesh.com \\
  --advertise-exit-node \\
  --accept-routes`}
              </pre>
              <p className="text-[11px] text-neutral-500 mt-3">Then approve the route in the <strong className="text-neutral-400">Routes</strong> tab.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exitNodeRoutes.map((r: any) => {
                const name = r.machine?.givenName || r.node?.givenName || "Unknown";
                const ip = r.machine?.ipAddresses?.[0] || r.node?.ipAddresses?.[0] || "";
                return (
                  <div key={r.id} className="flex items-center justify-between bg-black/30 rounded-xl border border-white/[0.06] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-white">{name}</p>
                      <p className="text-[11px] font-mono text-neutral-500">{ip} · {r.prefix}</p>
                    </div>
                    {r.enabled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20 text-[11px] font-medium">
                        Pending Approval
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── MagicDNS ─────────────────────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${magicDnsEnabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-neutral-600"}`}></span>
                MagicDNS
              </h2>
              <p className="text-[12px] text-neutral-500 mt-1">
                Automatic hostname resolution across the mesh network.
              </p>
            </div>
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              magicDnsEnabled
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                : "bg-neutral-800 text-neutral-500 ring-1 ring-inset ring-white/5"
            }`}>
              {magicDnsEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Base Domain</label>
              <div className="font-mono text-[13px] text-neutral-300 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5">
                {baseDomain || <span className="text-neutral-600">Not configured</span>}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Nameservers</label>
              <div className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5">
                {nameservers.length > 0 ? (
                  <ul className="space-y-1">
                    {nameservers.map((ns: string) => (
                      <li key={ns} className="font-mono text-[13px] text-neutral-300">{ns}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="font-mono text-[13px] text-neutral-600">No nameservers configured</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── API Config ───────────────────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md p-6">
          <h2 className="text-[16px] font-semibold text-white mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Control Server URL</label>
              <div className="font-mono text-[13px] text-neutral-300 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5">
                {process.env.HEADSCALE_API_URL || "https://api.lavamesh.com"}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">API Key</label>
              <div className="font-mono text-[13px] text-neutral-600 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5">
                {"•".repeat(28)}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACLs ─────────────────────────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-white">Access Control Lists</h2>
              <p className="text-[12px] text-neutral-500 mt-1">Manage network traffic rules via HuJSON.</p>
            </div>
            <button disabled className="bg-white/5 text-neutral-500 text-[12px] font-medium px-4 py-2 rounded-lg border border-white/5 cursor-not-allowed">
              Edit ACLs
            </button>
          </div>
          <div className="bg-black/50 rounded-lg border border-white/10 p-4 font-mono text-[11px] text-neutral-400 overflow-x-auto leading-relaxed">
            {`// Default Policy (Allow All)\n{\n  "acls": [\n    { "action": "accept", "src": ["*"], "dst": ["*:*"] }\n  ]\n}`}
          </div>
        </div>

      </div>
    </div>
  );
}
