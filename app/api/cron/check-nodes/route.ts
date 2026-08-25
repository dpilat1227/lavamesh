/**
 * app/api/cron/check-nodes/route.ts
 * Runs on Vercel Cron every 5 minutes (see vercel.json).
 * Detects nodes that went offline since the last run and sends an email alert.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodes } from '@/lib/headscale';
import { kvGet, kvSet } from '@/lib/kv';

interface NodeSnapshot {
  id: string;
  name: string;
  online: boolean;
  ip: string;
}

const SNAPSHOT_KEY = 'cron:node-snapshot';
const ALERTED_KEY = 'cron:alerted-offline'; // Set of node IDs already alerted

async function sendOfflineAlert(nodes: NodeSnapshot[]) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!adminEmail || !resendKey || nodes.length === 0) return;

  const nodeList = nodes
    .map(n => `• <strong>${n.name}</strong> (${n.ip}) went offline`)
    .join('<br/>');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LavaMesh Alerts <alerts@lavamesh.com>',
      to: [adminEmail],
      subject: `⚠️ ${nodes.length} node${nodes.length > 1 ? 's' : ''} went offline — LavaMesh`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #e5e5e5; border-radius: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
            <span style="font-size: 24px;">🔥</span>
            <span style="font-size: 18px; font-weight: 700; color: #fff;">LavaMesh</span>
          </div>
          <h2 style="color: #f87171; font-size: 20px; margin: 0 0 12px;">Node Offline Alert</h2>
          <p style="color: #a3a3a3; margin: 0 0 20px;">${nodeList}</p>
          <p style="color: #737373; font-size: 13px;">Check your dashboard for more details.</p>
          <a href="https://www.lavamesh.com/dashboard" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #FF5A00; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard →</a>
        </div>
      `,
    }),
  });
}

export async function GET(req: NextRequest) {
  // Validate cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nodes: any[] = await getNodes();
    const current: NodeSnapshot[] = nodes.map(n => ({
      id: String(n.id),
      name: n.givenName || n.name,
      online: n.online,
      ip: n.ipAddresses?.[0] ?? '',
    }));

    // Load previous snapshot and alerted set
    const [prev, alertedRaw] = await Promise.all([
      kvGet<NodeSnapshot[]>(SNAPSHOT_KEY),
      kvGet<string[]>(ALERTED_KEY),
    ]);

    const alreadyAlerted = new Set<string>(alertedRaw ?? []);
    const prevMap = new Map<string, NodeSnapshot>((prev ?? []).map(n => [n.id, n]));

    // Find newly-offline nodes (were online last run, now offline, not already alerted)
    const newlyOffline = current.filter(n => {
      const was = prevMap.get(n.id);
      return !n.online && was?.online === true && !alreadyAlerted.has(n.id);
    });

    // Find nodes that came back online — clear their alert flag
    const backOnline = current.filter(n => {
      const was = prevMap.get(n.id);
      return n.online && was?.online === false && alreadyAlerted.has(n.id);
    });
    backOnline.forEach(n => alreadyAlerted.delete(n.id));

    // Send alert for newly offline nodes
    if (newlyOffline.length > 0) {
      await sendOfflineAlert(newlyOffline);
      newlyOffline.forEach(n => alreadyAlerted.add(n.id));
    }

    // Persist updated snapshot and alerted set (TTL: 10 min safety buffer)
    await Promise.all([
      kvSet(SNAPSHOT_KEY, current, { ex: 600 }),
      kvSet(ALERTED_KEY, [...alreadyAlerted]),
    ]);

    return NextResponse.json({
      checked: current.length,
      online: current.filter(n => n.online).length,
      offline: current.filter(n => !n.online).length,
      alertsSent: newlyOffline.length,
      alertsCleared: backOnline.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
