import { getRoutes, getDnsConfig, getNameservers, getPolicy } from '@/lib/headscale';
import { getCurrentApiKey } from '@/lib/apikeys';
import { kvConfigured } from '@/lib/kv';
import AclEditor from './AclEditor';
import ApiKeyCard from './ApiKeyCard';
import TeamSettings from '@/components/TeamSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanStatus, type PlanTier } from '@/lib/billing';
import { Badge, Card, PageHeader, StatCard } from '@/components/ui';

const TIER_LABEL: Record<PlanTier, string> = { community: 'Community', pro: 'Pro', cloud: 'Cloud' };

async function fetchSettingsData() {
  const [routes, dns, ns, policy, apiKey] = await Promise.allSettled([
    getRoutes(), getDnsConfig(), getNameservers(), getPolicy(), getCurrentApiKey()
  ]);
  return {
    routes: routes.status === 'fulfilled' ? routes.value : [],
    dns: dns.status === 'fulfilled' ? dns.value : null,
    ns: ns.status === 'fulfilled' ? ns.value : null,
    policy: policy.status === 'fulfilled' ? policy.value : null,
    apiKey: apiKey.status === 'fulfilled' ? apiKey.value : null,
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
  const { routes, dns, ns, policy, apiKey } = await fetchSettingsData();

  let members: any[] = [];
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  try {
    if (userId) {
      const currentTenantUser = await prisma.tenantUser.findFirst({
        where: { userId }
      });
      if (currentTenantUser) {
        members = await prisma.tenantUser.findMany({
          where: { tenantId: currentTenantUser.tenantId },
          include: { user: true }
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch tenant members", e);
  }

  const plan = await getPlanStatus(userId).catch(() => ({ tier: 'community' as PlanTier, isPro: false, source: 'none' as const }));

  const exitRoutes = routes.filter((r: any) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0');
  const exitActive = exitRoutes.some((r: any) => r.enabled);
  const baseDomain: string = dns?.domains?.[0] || dns?.baseDomain || '';
  const nameservers: string[] = ns?.dnsConfig?.nameservers || ns?.nameservers || [];
  const magicDnsOn = nameservers.length > 0 || !!baseDomain;
  const customPolicy = !!(policy?.policy || policy?.acl);
  const headscaleKeyConfigured = !!process.env.HEADSCALE_API_KEY;
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
      <PageHeader
        title="Settings"
        subtitle="Network configuration and access control"
        actions={
          <Badge variant={plan.isPro ? 'green' : 'ghost'} dot={plan.isPro}>{TIER_LABEL[plan.tier]} plan</Badge>
        }
        stats={
          <div className="grid grid-cols-4 gap-4">
            <StatCard index={1} label="EXIT NODE" value={exitActive ? 'Active' : exitRoutes.length > 0 ? 'Pending' : 'Off'} color={exitActive ? 'var(--green)' : undefined} />
            <StatCard index={2} label="MAGIC DNS" value={magicDnsOn ? 'On' : 'Off'} color={magicDnsOn ? 'var(--green)' : undefined} />
            <StatCard index={3} label="ACL POLICY" value={customPolicy ? 'Custom' : 'Default'} color={customPolicy ? '#a78bfa' : undefined} />
            <StatCard index={4} label="TEAM" value={members.length > 0 ? members.length : '—'} />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6" style={{ minHeight: 0 }}>
        <div className="max-w-[860px] space-y-5">

          {/* Exit Node */}
          <Card accent="var(--purple)" padded={false} className="animate-fade-in-up">
            <div className="p-6">
              <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Exit Node</h2>
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>Route all client traffic through a designated node</p>
              {exitRoutes.length === 0 ? (
                <div>
                  <Badge className="mb-3">Not configured</Badge>
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
                        {r.enabled ? <Badge variant="green" dot pulse>Active</Badge> : <Badge variant="amber">Pending</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* MagicDNS */}
          <Card accent={magicDnsOn ? 'var(--green)' : 'var(--text-4)'} padded={false} className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-1)' }}>MagicDNS</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Automatic hostname resolution across the mesh</p>
                </div>
                <Badge variant={magicDnsOn ? 'green' : 'ghost'} dot={magicDnsOn}>{magicDnsOn ? 'Enabled' : 'Disabled'}</Badge>
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
          </Card>

          {/* Developer API Key */}
          <ApiKeyCard apiKey={apiKey} kvReady={kvConfigured()} isPro={plan.isPro} />

          {/* ACL Editor */}
          <Card accent="var(--amber)" padded={false} className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="p-6">
              <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Access Control Policy</h2>
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>HuJSON policy defining which devices can communicate</p>
              <AclEditor initialPolicy={policyText} policyAvailable={!!policy} />
            </div>
          </Card>

          {/* API Config */}
          <Card accent="var(--orange)" padded={false} className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="p-6">
              <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Control Plane Connection</h2>
              <InfoRow label="Control Server" value={process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com'} mono />
              <div className="flex items-center justify-between py-3">
                <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Admin API Key</span>
                <Badge variant={headscaleKeyConfigured ? 'green' : 'red'}>{headscaleKeyConfigured ? 'Configured' : 'Not set'}</Badge>
              </div>
              <InfoRow label="Headscale Compatibility" value="v0.22.3" />
            </div>
          </Card>

          {/* Team Settings */}
          {members.length > 0 && <TeamSettings members={members} />}

        </div>
      </div>
    </div>
  );
}
