import { getRoutes, getDnsConfig, getNameservers, getPolicy, headscaleLoginServer } from '@/lib/headscale';
import { getCurrentApiKey } from '@/lib/apikeys';
import { kvConfigured } from '@/lib/kv';
import { getNotificationConfig } from '@/lib/notifications';
import { listBackups } from '@/lib/backups';
import AclPolicyCard from './AclPolicyCard';
import ApiKeyCard from './ApiKeyCard';
import BackupsCard from './BackupsCard';
import CloudInstanceCard from './CloudInstanceCard';
import DnsRecordsCard from './DnsRecordsCard';
import NotificationSettings from './NotificationSettings';
import TeamSettings from '@/components/TeamSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getExtraRecords, policyTextFromResponse } from '@/lib/policyDns';
import { Badge, Card, CopyableCommand, DegradedBanner, PageHeader, StatCard } from '@/components/ui';

export const dynamic = 'force-dynamic';

async function fetchSettingsData() {
  const [routes, dns, ns, policy, apiKey, notifications, backups, loginServer] = await Promise.allSettled([
    getRoutes(), getDnsConfig(), getNameservers(), getPolicy(), getCurrentApiKey(), getNotificationConfig(), listBackups(), headscaleLoginServer()
  ]);
  // The fallbacks below are what keep the page renderable, but on their own
  // they're indistinguishable from real state: a failed getDnsConfig() reads
  // as "MagicDNS: Off", a failed getCurrentApiKey() as "no key configured".
  // Collect the names of whatever we couldn't reach so the page can say so.
  const degraded = (
    [
      ['Exit routes', routes],
      ['DNS config', dns],
      ['Nameservers', ns],
      ['ACL policy', policy],
      ['API key', apiKey],
      ['Notification settings', notifications],
      ['Backups', backups],
    ] as const
  )
    .filter(([, r]) => r.status === 'rejected')
    .map(([label]) => label);

  const firstReason = [routes, dns, ns, policy, apiKey, notifications, backups]
    .find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason;

  return {
    routes: routes.status === 'fulfilled' ? routes.value : [],
    dns: dns.status === 'fulfilled' ? dns.value : null,
    ns: ns.status === 'fulfilled' ? ns.value : null,
    policy: policy.status === 'fulfilled' ? policy.value : null,
    apiKey: apiKey.status === 'fulfilled' ? apiKey.value : null,
    notifications: notifications.status === 'fulfilled' ? notifications.value : { emailEnabled: true, email: '', webhookEnabled: false, webhookUrl: '', failoverAlertsEnabled: false },
    backups: backups.status === 'fulfilled' ? backups.value : [],
    loginServer: loginServer.status === 'fulfilled' ? loginServer.value : 'https://mesh.lavamesh.com',
    degraded,
    degradedDetail: firstReason?.message as string | undefined,
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

/** Groups Settings' ~9 previously-flat cards into named sections so the page
 *  reads as "Network, then Security, then Operations, then Team" instead of
 *  one long undifferentiated stack where every card competes for attention. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2 first:pt-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-4)', letterSpacing: '0.09em' }}>{children}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border-1)' }} />
    </div>
  );
}

export default async function SettingsPage() {
  const { routes, dns, ns, policy, apiKey, notifications, backups, loginServer, degraded, degradedDetail } = await fetchSettingsData();

  let members: any[] = [];
  let cloudInstance: { url: string; status: string; region: string | null; errorMessage: string | null; provisionedAt: Date | null } | null = null;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  try {
    if (userId) {
      const currentTenantUser = await prisma.tenantUser.findFirst({
        where: { userId }
      });
      if (currentTenantUser) {
        const [team, instance] = await Promise.all([
          prisma.tenantUser.findMany({
            where: { tenantId: currentTenantUser.tenantId },
            include: { user: true }
          }),
          prisma.headscaleInstance.findUnique({ where: { tenantId: currentTenantUser.tenantId } }),
        ]);
        members = team;
        if (instance) {
          cloudInstance = {
            url: instance.url,
            status: instance.status,
            region: instance.region,
            errorMessage: instance.errorMessage,
            provisionedAt: instance.provisionedAt,
          };
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch tenant members", e);
  }

  const exitRoutes = routes.filter((r: any) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0');
  const exitActive = exitRoutes.some((r: any) => r.enabled);
  // Card accent mirrors real state (matches MagicDNS below), not a fixed decorative hue:
  // green when actually routing traffic, amber while a route is advertised but unapproved,
  // neutral when off.
  const exitAccent = exitActive ? 'var(--green)' : exitRoutes.length > 0 ? 'var(--amber)' : undefined;
  const baseDomain: string = dns?.domains?.[0] || dns?.baseDomain || '';
  const nameservers: string[] = ns?.dnsConfig?.nameservers || ns?.nameservers || [];
  const magicDnsOn = nameservers.length > 0 || !!baseDomain;
  const customPolicy = !!(policy?.policy || policy?.acl);
  const headscaleKeyConfigured = !!process.env.HEADSCALE_API_KEY;
  const policyText: string =
    policyTextFromResponse(policy) ||
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
  const extraDnsRecords = getExtraRecords(policyText);

  // A StatCard reading "Off" or "Default" is a claim about the user's config.
  // If the call that would have told us failed, we don't get to make it — show
  // an unknown dash and let the banner explain.
  const unknown = (label: (typeof degraded)[number]) => degraded.includes(label);
  const dnsUnknown = unknown('DNS config') || unknown('Nameservers');

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader
        title="Settings"
        subtitle="Network configuration and access control"
        stats={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="EXIT NODE" value={unknown('Exit routes') ? '—' : exitActive ? 'Active' : exitRoutes.length > 0 ? 'Pending' : 'Off'} color={exitActive ? 'var(--green)' : undefined} />
            <StatCard label="MAGIC DNS" value={unknown('DNS config') || unknown('Nameservers') ? '—' : magicDnsOn ? 'On' : 'Off'} color={magicDnsOn ? 'var(--green)' : undefined} />
            <StatCard label="ACL POLICY" value={unknown('ACL policy') ? '—' : customPolicy ? 'Custom' : 'Default'} />
            <StatCard label="TEAM" value={members.length > 0 ? members.length : '—'} />
          </div>
        }
      />

      {degraded.length > 0 && (
        <DegradedBanner
          message={`Couldn't load ${degraded.join(', ')} from Headscale. The values shown for those may be defaults, not your real configuration.`}
          detail={degradedDetail}
        />
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-6" style={{ minHeight: 0 }}>
        <div style={{ maxWidth: 860 }}>
        <div className="space-y-5">

          {cloudInstance && (
            <>
              <SectionLabel>Account</SectionLabel>
              <CloudInstanceCard instance={cloudInstance} />
            </>
          )}

          <SectionLabel>Network</SectionLabel>
          {/* Exit Node */}
          <Card accent={exitAccent} padded={false} className="animate-fade-in-up">
            <div className="p-6">
              <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Exit Node</h2>
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>Route all client traffic through a designated node</p>
              {exitRoutes.length === 0 ? (
                <div>
                  <Badge className="mb-3">Not configured</Badge>
                  <div className="mt-3">
                    <CopyableCommand command={`sudo tailscale up --login-server=${loginServer} --advertise-exit-node --accept-routes`} />
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
                        style={{ background: r.enabled ? 'rgba(61,220,132,0.04)' : 'var(--surface-3)', border: `1px solid ${r.enabled ? 'rgba(61,220,132,0.12)' : 'var(--border-2)'}` }}>
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
          <Card accent={magicDnsOn && !dnsUnknown ? 'var(--green)' : undefined} padded={false} className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-1)' }}>MagicDNS</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Automatic hostname resolution across the mesh</p>
                </div>
                <Badge variant={dnsUnknown ? 'amber' : magicDnsOn ? 'green' : 'ghost'} dot={magicDnsOn && !dnsUnknown}>
                  {dnsUnknown ? 'Unknown' : magicDnsOn ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <InfoRow label="Base Domain" value={baseDomain || (unknown('DNS config') ? "Couldn't load" : 'Not configured')} mono={!!baseDomain} />
              <div className="pt-3">
                <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Nameservers</span>
                <div className="mt-2 space-y-1">
                  {nameservers.length > 0 ? nameservers.map((ns: string) => (
                    <div key={ns} className="px-3 py-1.5 rounded-[8px] text-[12px]" style={{ background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border-1)', fontFamily: 'var(--font-mono)' }}>{ns}</div>
                  )) : <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>{unknown('Nameservers') ? "Couldn't load nameservers from Headscale" : 'No nameservers configured'}</p>}
                </div>
              </div>
              <DnsRecordsCard records={extraDnsRecords} policyAvailable={!!policy} />
            </div>
          </Card>

          <SectionLabel>Security &amp; Access</SectionLabel>
          {/* Developer API Key */}
          <ApiKeyCard apiKey={apiKey} kvReady={kvConfigured()} />

          {/* ACL Editor */}
          <Card padded={false} className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="p-6">
              <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Access Control Policy</h2>
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>HuJSON policy defining which devices can communicate</p>
              <AclPolicyCard initialPolicy={policyText} policyAvailable={!!policy} />
            </div>
          </Card>

          <SectionLabel>Operations</SectionLabel>
          {/* API Config */}
          <Card padded={false} className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="p-6">
              <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Control Plane Connection</h2>
              <InfoRow label="Control Server" value={process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com'} mono />
              <InfoRow label="Login Server" value={loginServer} mono />
              <div className="flex items-center justify-between py-3">
                <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>Admin API Key</span>
                <Badge variant={headscaleKeyConfigured ? 'green' : 'red'}>{headscaleKeyConfigured ? 'Configured' : 'Not set'}</Badge>
              </div>
              <InfoRow label="Headscale Compatibility" value="v0.22 – v0.26" />
            </div>
          </Card>

          {/* Config Backups */}
          <BackupsCard initialBackups={backups} kvReady={kvConfigured()} />

          {/* Alerts & Notifications */}
          <NotificationSettings config={notifications} hasResend={!!process.env.RESEND_API_KEY} />

          <SectionLabel>Team</SectionLabel>
          <TeamSettings members={members} />

        </div>
        </div>
      </div>
    </div>
  );
}
