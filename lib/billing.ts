/**
 * lib/billing.ts — Plan/entitlement resolution.
 *
 * LavaMesh ships three tiers (see components/PricingSection.tsx):
 *   - Community: free, self-hosted, no Pro features.
 *   - Pro:       self-hosted + a license key (sold as a one-time/monthly Stripe
 *                Payment Link, not wired through /api/checkout).
 *   - Cloud:     we host it; paid via the in-app Stripe Checkout flow
 *                (/api/checkout, app/api/webhooks/stripe), which writes a
 *                `Subscription` row keyed by tenantId.
 *
 * A self-hosted operator who bought a Pro license has no Tenant/Subscription
 * row at all, so the license key is checked first via an env var. This is a
 * presence check, not cryptographic verification — good enough to gate UI
 * for now, but not a substitute for real license validation if that becomes
 * a distribution concern.
 */

import { prisma } from './prisma';

export type PlanTier = 'community' | 'pro' | 'cloud';

export interface PlanStatus {
  tier: PlanTier;
  isPro: boolean; // true for 'pro' and 'cloud'
  source: 'license' | 'subscription' | 'none';
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const PRO_PLANS: Record<string, PlanTier> = { pro: 'pro', cloud: 'cloud' };

const COMMUNITY: PlanStatus = { tier: 'community', isPro: false, source: 'none' };

export function hasLicenseKey(): boolean {
  return !!process.env.LAVAMESH_LICENSE_KEY?.trim();
}

export async function getTenantIdForUser(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  const tenantUser = await prisma.tenantUser.findFirst({ where: { userId } });
  return tenantUser?.tenantId ?? null;
}

export async function getPlanStatus(userId: string | null | undefined): Promise<PlanStatus> {
  if (hasLicenseKey()) {
    return { tier: 'pro', isPro: true, source: 'license' };
  }

  const tenantId = await getTenantIdForUser(userId);
  if (!tenantId) return COMMUNITY;

  const sub = await prisma.subscription.findUnique({ where: { tenantId } });
  if (!sub) return COMMUNITY;

  const tier = PRO_PLANS[sub.plan];
  const active = ACTIVE_STATUSES.has(sub.status) && sub.currentPeriodEnd.getTime() > Date.now();
  if (tier && active) {
    return { tier, isPro: true, source: 'subscription' };
  }
  return { ...COMMUNITY, source: 'subscription' };
}
