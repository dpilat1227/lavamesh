import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Security: Only allow internal services (like Stripe webhooks) to call this
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.PROVISIONING_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await req.json();
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    // 1. Verify Tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // 2. MOCK: Spawn Container / Fly.io Machine
    // In production, this would make a real fetch() to Fly.io Machines API
    // e.g. await fetch('https://api.machines.dev/v1/apps/.../machines', { ... })
    console.log(`[Provisioning Engine] Spawning isolated Headscale container for Tenant ${tenantId}...`);
    
    // Simulate boot time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK URLs
    const assignedUrl = `https://headscale-${tenantId.toLowerCase()}.lavamesh.cloud`;
    const assignedApiKey = `hs_live_${Math.random().toString(36).substring(2, 15)}`;

    console.log(`[Provisioning Engine] Container ready at ${assignedUrl}`);

    // 3. Store the generated instance in Postgres
    const instance = await prisma.headscaleInstance.upsert({
      where: { tenantId },
      create: {
        tenantId,
        url: assignedUrl,
        apiKey: assignedApiKey
      },
      update: {
        url: assignedUrl,
        apiKey: assignedApiKey
      }
    });

    return NextResponse.json({ success: true, instance });
  } catch (error: any) {
    console.error("[Provisioning Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
