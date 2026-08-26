import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tenant/cloud-status — lightweight poll target for
 * components/CloudProvisioningStatus.tsx while a Cloud instance boots.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantUser = await prisma.tenantUser.findFirst({ where: { userId }, include: { tenant: { include: { headscaleInstance: true } } } });
  const instance = tenantUser?.tenant?.headscaleInstance;
  if (!instance) return NextResponse.json({ status: 'none' });

  return NextResponse.json({ status: instance.status, errorMessage: instance.errorMessage });
}
