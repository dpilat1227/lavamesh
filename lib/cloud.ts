import { prisma } from '@/lib/prisma';

/** Server-side charge gate. UI uses NEXT_PUBLIC_CLOUD_CHECKOUT_ENABLED. Set both. */
export function isCloudCheckoutEnabled(): boolean {
  return process.env.CLOUD_CHECKOUT_ENABLED === 'true';
}

export function cloudBetaCap(): number {
  const n = Number(process.env.CLOUD_BETA_CAP);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

/**
 * Counts seats actually in use — 'active' (provisioned and running) or
 * 'provisioning' (mid-boot, will become active or error shortly). Excludes
 * 'error': every failed provision attempt (missing FLY_API_TOKEN, a Fly API
 * exception, or a canceled subscription's teardown) writes a permanent
 * HeadscaleInstance row with status='error' that's never deleted — counting
 * those would let dead/failed/churned rows quietly eat real beta seats
 * forever, with no way to reclaim them. See app/api/provision/route.ts and
 * the cancellation handler in app/api/webhooks/stripe/route.ts.
 */
export async function countCloudTenants(): Promise<number> {
  return prisma.headscaleInstance.count({ where: { status: { in: ['active', 'provisioning'] } } });
}

export async function cloudBetaFull(): Promise<boolean> {
  return (await countCloudTenants()) >= cloudBetaCap();
}

export type CloudReadyCheck = { key: string; ok: boolean; hint: string };

/** What must be set before flipping checkout. Never includes secret values. */
export function cloudReadyChecks(): CloudReadyCheck[] {
  const set = (key: string) => !!process.env[key]?.trim();
  return [
    { key: 'FLY_API_TOKEN', ok: set('FLY_API_TOKEN'), hint: 'Fly deploy token — without this, provision writes status=error' },
    { key: 'FLY_ORG_SLUG', ok: set('FLY_ORG_SLUG'), hint: 'Fly org (defaults to personal if unset — set it anyway)' },
    { key: 'PROVISIONING_SECRET', ok: set('PROVISIONING_SECRET'), hint: 'Shared by /api/provision and the machine callback' },
    { key: 'STRIPE_SECRET_KEY', ok: set('STRIPE_SECRET_KEY') && !process.env.STRIPE_SECRET_KEY?.includes('mock'), hint: 'Live or test Stripe secret' },
    { key: 'STRIPE_WEBHOOK_SECRET', ok: set('STRIPE_WEBHOOK_SECRET'), hint: 'Required or checkout.session.completed never provisions' },
    { key: 'RESEND_API_KEY', ok: set('RESEND_API_KEY'), hint: 'Magic links + waitlist + alerts' },
    { key: 'NEXTAUTH_SECRET', ok: set('NEXTAUTH_SECRET'), hint: 'Auth sessions' },
    { key: 'NEXTAUTH_URL', ok: set('NEXTAUTH_URL'), hint: 'Checkout success/cancel + provision callback origin' },
    { key: 'POSTGRES_URL', ok: set('POSTGRES_URL') || set('DATABASE_URL'), hint: 'Prisma' },
    { key: 'KV_REDIS_URL', ok: set('KV_REDIS_URL'), hint: 'License, audit, backups, API keys' },
  ];
}

export function cloudReadySummary() {
  const checks = cloudReadyChecks();
  return { ready: checks.every(c => c.ok), checks };
}
