import { NextResponse } from 'next/server';
import { cloudBetaCap, cloudReadySummary, countCloudTenants, isCloudCheckoutEnabled } from '@/lib/cloud';

/**
 * Ops checklist for Cloud beta. No secret values — just which env keys are set.
 * Auth: CRON_SECRET (same as other cron/admin routes).
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = cloudReadySummary();
  const tenants = await countCloudTenants();
  return NextResponse.json({
    ...summary,
    checkoutEnabled: isCloudCheckoutEnabled(),
    tenants,
    cap: cloudBetaCap(),
    seatsLeft: Math.max(0, cloudBetaCap() - tenants),
  });
}
