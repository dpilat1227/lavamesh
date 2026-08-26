/**
 * lib/tenant.ts — Every signed-in operator should have a Tenant row.
 *
 * Team seats, Cloud instances, and uptime logs all hang off Tenant.
 * Checkout creates one, but self-hosted Community/Pro users never go through
 * Stripe — without this, Team Settings never renders and the advertised
 * 2-seat free limit is unreachable.
 */

import { prisma } from './prisma';

export async function ensureTenantForUser(
  userId: string,
  opts?: { email?: string | null; name?: string | null }
): Promise<string> {
  const existing = await prisma.tenantUser.findFirst({ where: { userId } });
  if (existing) return existing.tenantId;

  const label = opts?.name || opts?.email?.split('@')[0] || 'My';
  const tenant = await prisma.tenant.create({
    data: {
      name: `${label}'s Network`,
      users: { create: { userId, role: 'OWNER' } },
    },
  });
  return tenant.id;
}
