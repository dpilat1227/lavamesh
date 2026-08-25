import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchHeadscale } from '@/lib/headscale';

export async function GET(req: Request) {
  try {
    // 1. Verify this is called by Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all Tenants with an active Headscale instance
    const tenants = await prisma.tenant.findMany({
      where: { headscaleInstance: { isNot: null } },
      include: { headscaleInstance: true }
    });

    if (tenants.length === 0) {
      return NextResponse.json({ ok: true, message: 'No active tenants found.' });
    }

    let recordsCreated = 0;

    // 3. For each tenant, fetch their nodes and log status
    // To prevent timeout on a huge SaaS, this should be done in batches
    // For now, doing it sequentially is fine for Phase 1 of Cloud
    for (const tenant of tenants) {
      try {
        if (!tenant.headscaleInstance) continue;

        const baseUrl = tenant.headscaleInstance.url;
        const apiKey = tenant.headscaleInstance.apiKey;

        const url = `${baseUrl}/api/v1/machine`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        clearTimeout(timeout);

        if (!res.ok) continue;

        const data = await res.json();
        const machines = data.machines || [];

        // Determine online status based on lastSeen
        // A node is considered offline if it hasn't been seen in the last 2 minutes
        const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);

        const logs = machines.map((m: any) => {
          const lastSeen = new Date(m.lastSeen);
          return {
            machineId: m.id,
            tenantId: tenant.id,
            isOnline: lastSeen > twoMinsAgo,
          };
        });

        if (logs.length > 0) {
          await prisma.nodeStatusLog.createMany({
            data: logs
          });
          recordsCreated += logs.length;
        }
      } catch (err) {
        console.warn(`[Cron] Failed to fetch nodes for Tenant ${tenant.id}`, err);
      }
    }

    return NextResponse.json({ ok: true, recordsCreated });
  } catch (error: any) {
    console.error('[Cron] Uptime poll error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
