import { getNodes } from "@/lib/headscale";
import DashboardClient from "@/app/DashboardClient";
import { getTagsForNodes } from "@/lib/tags";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const nodes = await getNodes();
  const tags = await getTagsForNodes(nodes.map((n: any) => n.id));

  let logs: any[] = [];
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.id) {
      const tenantUser = await prisma.tenantUser.findFirst({
        where: { userId: (session?.user as any).id },
      });
      if (tenantUser) {
        // Fetch logs for the last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        logs = await prisma.nodeStatusLog.findMany({
          where: { 
            tenantId: tenantUser.tenantId,
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'asc' }
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch uptime logs", e);
  }

  return <DashboardClient nodes={nodes} initialTags={tags} uptimeLogs={logs} />;
}
