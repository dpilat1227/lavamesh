import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers } from '@/lib/headscale';

export const dynamic = 'force-dynamic';

/**
 * Liveness probe for the tenant's Headscale control plane.
 *
 * The sidebar used to print a hardcoded "Connected" under the control-plane
 * host, which stayed reassuring even while every page on screen was failing to
 * load — the single worst place in the app to be confidently wrong. This gives
 * it something real to render.
 *
 * `/user` is the cheapest authenticated call that proves both reachability and
 * a valid API key.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    await getUsers();
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Control plane did not respond' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
