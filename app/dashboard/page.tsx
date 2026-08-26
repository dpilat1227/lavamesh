import { getNodes } from "@/lib/headscale";
import DashboardClient from "@/app/DashboardClient";
import CloudProvisioningStatus from "@/components/CloudProvisioningStatus";
import HeadscaleUnavailable from "@/components/HeadscaleUnavailable";
import { getTagsForNodes } from "@/lib/tags";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureTenantForUser } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  let tenantId: string | null = null;
  if (userId) {
    tenantId = await ensureTenantForUser(userId, {
      email: session?.user?.email,
      name: session?.user?.name,
    }).catch(() => null);
  }

  // Cloud tenants get a dedicated Headscale instance that's provisioned
  // asynchronously (see app/api/provision) — don't attempt the normal
  // dashboard fetch (which would just fail with no/invalid credentials)
  // until it's actually ready.
  if (tenantId) {
    const instance = await prisma.headscaleInstance.findUnique({ where: { tenantId } }).catch(() => null);
    if (instance && instance.status !== 'active') {
      return <CloudProvisioningStatus initialStatus={instance.status} initialError={instance.errorMessage} />;
    }
  }

  let nodes: any[] = [];
  try {
    nodes = await getNodes();
  } catch (e: any) {
    return <HeadscaleUnavailable message={e?.message} />;
  }
  const tags = await getTagsForNodes(nodes.map((n: any) => n.id));

  let logs: any[] = [];
  try {
    if (tenantId) {
      // Fetch logs for the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      logs = await prisma.nodeStatusLog.findMany({
        where: {
          tenantId,
          createdAt: { gte: yesterday }
        },
        orderBy: { createdAt: 'asc' }
      });
    }
  } catch (e) {
    console.error("Failed to fetch uptime logs", e);
  }

  return <DashboardClient nodes={nodes} initialTags={tags} uptimeLogs={logs} />;
}
