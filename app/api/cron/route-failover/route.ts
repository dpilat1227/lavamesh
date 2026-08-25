/**
 * app/api/cron/route-failover/route.ts
 * Runs on Vercel Cron every 5 minutes (see vercel.json).
 *
 * Headscale automatically promotes a backup subnet router to primary if the
 * active one goes offline — that failover is free and happens with zero
 * config on any plan. This job just watches for it and alerts (Pro/Cloud
 * perk — see lib/notifications.ts#sendFailoverAlert), and logs it to the
 * audit trail either way so it's visible even without alerts configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRoutes } from '@/lib/headscale';
import { kvGet, kvSet } from '@/lib/kv';
import { sendFailoverAlert } from '@/lib/notifications';
import { logEvent } from '@/lib/audit';

interface RouteSnapshot {
  prefix: string;
  primaryNodeId: string | null;
  primaryNodeName: string;
  advertiserCount: number;
}

const SNAPSHOT_KEY = 'cron:route-snapshot';

function nodeLabel(route: any): { id: string; name: string } {
  const machine = route.machine || route.node;
  return { id: String(machine?.id ?? ''), name: machine?.givenName || machine?.name || 'unknown' };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const routes: any[] = await getRoutes();
    const isExitNode = (r: any) => r.prefix === '0.0.0.0/0' || r.prefix === '::/0';
    const subnetRoutes = routes.filter(r => !isExitNode(r) && r.enabled);

    const byPrefix = new Map<string, any[]>();
    for (const r of subnetRoutes) {
      if (!byPrefix.has(r.prefix)) byPrefix.set(r.prefix, []);
      byPrefix.get(r.prefix)!.push(r);
    }

    const current: RouteSnapshot[] = [...byPrefix.entries()].map(([prefix, group]) => {
      const primary = group.find(r => r.isPrimary) ?? null;
      const label = primary ? nodeLabel(primary) : { id: null as any, name: '' };
      return { prefix, primaryNodeId: label.id, primaryNodeName: label.name, advertiserCount: group.length };
    });

    const prev = (await kvGet<RouteSnapshot[]>(SNAPSHOT_KEY)) ?? [];
    const prevMap = new Map(prev.map(s => [s.prefix, s]));

    // Only counts as a real failover when there were multiple advertisers and the
    // primary actually changed to a different, known node — not first-time assignment.
    const failovers = current.filter(s => {
      const was = prevMap.get(s.prefix);
      return (
        was &&
        was.primaryNodeId &&
        s.primaryNodeId &&
        was.primaryNodeId !== s.primaryNodeId &&
        (was.advertiserCount > 1 || s.advertiserCount > 1)
      );
    });

    for (const f of failovers) {
      const was = prevMap.get(f.prefix)!;
      await logEvent('route.failover', { prefix: f.prefix, from: was.primaryNodeName, to: f.primaryNodeName });
    }

    if (failovers.length > 0) {
      await sendFailoverAlert(
        failovers.map(f => ({ prefix: f.prefix, from: prevMap.get(f.prefix)!.primaryNodeName, to: f.primaryNodeName }))
      );
    }

    await kvSet(SNAPSHOT_KEY, current, { ex: 600 });

    return NextResponse.json({ checked: current.length, failovers: failovers.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
