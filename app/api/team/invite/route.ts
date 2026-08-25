import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { seatsRemaining, COMMUNITY_SEAT_LIMIT } from '@/lib/billing';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Verify current user has permission to invite (must be OWNER or ADMIN)
    const currentTenantUser = await prisma.tenantUser.findFirst({
      where: { userId: (session?.user as any).id },
      include: { tenant: true }
    });

    if (!currentTenantUser || currentTenantUser.role === 'MEMBER') {
      return NextResponse.json({ error: 'You do not have permission to invite users' }, { status: 403 });
    }

    const tenantId = currentTenantUser.tenantId;

    // Enforce the Community-tier seat cap — unlimited on Pro/Cloud.
    const memberCount = await prisma.tenantUser.count({ where: { tenantId } });
    const remaining = await seatsRemaining(tenantId, memberCount);
    if (remaining === 0) {
      return NextResponse.json(
        { error: `Free plan is limited to ${COMMUNITY_SEAT_LIMIT} team members. Upgrade to Pro or Cloud for unlimited seats.` },
        { status: 402 }
      );
    }

    // Find or create the invited user
    let invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: { email }
      });
    }

    // Check if they are already in the tenant
    const existingMembership = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: invitedUser.id
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this network' }, { status: 409 });
    }

    // Add them to the tenant
    await prisma.tenantUser.create({
      data: {
        tenantId,
        userId: invitedUser.id,
        role: 'ADMIN' // Default new invites to ADMIN for now
      }
    });

    return NextResponse.json({ ok: true, message: 'User invited successfully' });
  } catch (err: any) {
    console.error('[Team Invite Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
