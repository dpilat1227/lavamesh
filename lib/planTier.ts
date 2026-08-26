/**
 * Client-safe plan-tier constants. Deliberately has zero imports (no prisma/pg)
 * so client components (Sidebar, MainLayout) can import the tier label map
 * without dragging server-only DB drivers into the browser bundle — that's
 * exactly what happened when they imported this from lib/billing.ts directly,
 * since importing any value from a module also pulls in its side-effectful
 * top-level imports (e.g. `import { prisma } from './prisma'`).
 */
export type PlanTier = 'community' | 'pro' | 'cloud';

export const TIER_LABEL: Record<PlanTier, string> = { community: 'Community', pro: 'Pro', cloud: 'Cloud' };
