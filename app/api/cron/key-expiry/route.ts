/**
 * app/api/cron/key-expiry/route.ts
 * Runs on Vercel Cron (see vercel.json).
 * Alerts once per pre-auth key when it's within 24h of expiring and still
 * unused — the same "notify before something silently breaks" idea as
 * app/api/cron/check-nodes, applied to keys instead of nodes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsers, listPreAuthKeys } from '@/lib/headscale';
import { kvGet, kvSet } from '@/lib/kv';
import { sendKeyExpiringAlert } from '@/lib/notifications';

const ALERTED_KEY = 'cron:alerted-key-expiry'; // Set of key strings already alerted
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users: any[] = await getUsers().catch(() => []);
    const userNames = users.map((u: any) => u.name).filter(Boolean);
    if (!userNames.includes('admin')) userNames.unshift('admin');

    const nested = await Promise.all(
      userNames.map((name: string) => listPreAuthKeys(name).catch(() => []))
    );
    const keys: any[] = nested.flat();

    const alertedRaw = await kvGet<string[]>(ALERTED_KEY);
    const alreadyAlerted = new Set<string>(alertedRaw ?? []);

    const now = Date.now();
    const expiringSoon = keys.filter((k: any) => {
      if (k.used || !k.expiration || k.expiration.startsWith('0001')) return false;
      const exp = new Date(k.expiration).getTime();
      return exp > now && exp - now <= WINDOW_MS && !alreadyAlerted.has(k.key);
    });

    // Drop keys from the alerted set once they've actually expired or been used,
    // so a reused/rotated key string (unlikely, but keys are opaque) doesn't stay
    // suppressed forever.
    const stillRelevant = new Set(
      keys.filter((k: any) => !k.used && k.expiration && new Date(k.expiration).getTime() > now).map((k: any) => k.key)
    );
    for (const key of [...alreadyAlerted]) {
      if (!stillRelevant.has(key)) alreadyAlerted.delete(key);
    }

    if (expiringSoon.length > 0) {
      await sendKeyExpiringAlert(
        expiringSoon.map((k: any) => ({
          user: k.user?.name || 'admin',
          keyPrefix: k.key.slice(0, 8),
          expiresAt: k.expiration,
        }))
      );
      expiringSoon.forEach((k: any) => alreadyAlerted.add(k.key));
    }

    await kvSet(ALERTED_KEY, [...alreadyAlerted]);

    return NextResponse.json({
      checked: keys.length,
      expiringSoon: expiringSoon.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
