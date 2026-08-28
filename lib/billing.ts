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

import { cache } from 'react';
import { prisma } from './prisma';
import { kvGet, kvSet } from './kv';
import type { PlanTier } from './planTier';

export type { PlanTier } from './planTier';
export { TIER_LABEL } from './planTier';

export interface PlanStatus {
  tier: PlanTier;
  isPro: boolean; // true for 'pro' and 'cloud'
  source: 'license' | 'subscription' | 'none';
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const PRO_PLANS: Record<string, PlanTier> = { pro: 'pro', cloud: 'cloud' };

const COMMUNITY: PlanStatus = { tier: 'community', isPro: false, source: 'none' };

/**
 * Free-tier team-seat cap (see components/PricingSection.tsx — collaboration
 * is the one limit that's meaningfully enforceable regardless of hosting
 * model, since it lives in this app's own database rather than Headscale).
 *
 * Set to 5: generous enough that a small team or household can collaborate
 * without hitting a wall, while still leaving "unlimited seats" as a real
 * reason to upgrade once a team outgrows it. Pro and Cloud have unlimited
 * seats. (Was 1 — raised to look, and be, less stingy while validating what
 * small teams actually need.)
 */
export const COMMUNITY_SEAT_LIMIT = 5;

const LICENSE_KV_KEY = 'license:key';

/**
 * Every function below is wrapped in React's `cache()`. Root layout and the
 * page it wraps both need plan/tenant info (nav badge vs. page content), so
 * without this each request was paying for the *same* TenantUser lookup,
 * license KV read, and Subscription lookup twice — once from layout, once
 * from the page — as sequential round-trips (a real, measurable chunk of the
 * "why does this feel slow" latency, on top of dev-mode/Turbopack overhead).
 * `cache()` memoizes by arguments for the lifetime of a single server
 * render, then discards — it never leaks state across requests or users. */
export const hasLicenseKey = cache(async (): Promise<boolean> => {
  if (process.env.LAVAMESH_LICENSE_KEY?.trim()) return true;
  const stored = await kvGet<string>(LICENSE_KV_KEY);
  const value = typeof stored === 'string' ? stored : stored != null ? String(stored) : '';
  return !!value.trim();
});

export async function saveLicenseKey(key: string): Promise<void> {
  await kvSet(LICENSE_KV_KEY, key.trim());
}

export const getTenantIdForUser = cache(async (userId: string | null | undefined): Promise<string | null> => {
  if (!userId) return null;
  const tenantUser = await prisma.tenantUser.findFirst({ where: { userId } });
  return tenantUser?.tenantId ?? null;
});

/** Resolves plan status directly from a tenantId, skipping the userId → tenantId lookup. */
export const getPlanStatusForTenant = cache(async (tenantId: string | null | undefined): Promise<PlanStatus> => {
  if (await hasLicenseKey()) {
    return { tier: 'pro', isPro: true, source: 'license' };
  }
  if (!tenantId) return COMMUNITY;

  const sub = await prisma.subscription.findUnique({ where: { tenantId } });
  if (!sub) return COMMUNITY;

  const tier = PRO_PLANS[sub.plan];
  const active = ACTIVE_STATUSES.has(sub.status) && sub.currentPeriodEnd.getTime() > Date.now();
  if (tier && active) {
    return { tier, isPro: true, source: 'subscription' };
  }
  return { ...COMMUNITY, source: 'subscription' };
});

export const getPlanStatus = cache(async (userId: string | null | undefined): Promise<PlanStatus> => {
  const tenantId = await getTenantIdForUser(userId);
  return getPlanStatusForTenant(tenantId);
});

/** How many additional seats a tenant can fill, or null if unlimited (Pro/Cloud). */
export async function seatsRemaining(tenantId: string, currentMemberCount: number): Promise<number | null> {
  const plan = await getPlanStatusForTenant(tenantId);
  if (plan.isPro) return null;
  return Math.max(0, COMMUNITY_SEAT_LIMIT - currentMemberCount);
}
