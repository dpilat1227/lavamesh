import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flyConfigured, createFlyApp, allocateSharedIpv4, createVolume, createMachine } from "@/lib/fly";
import { buildHeadscaleConfig, buildBootstrapScript } from "@/lib/headscaleConfig";

/**
 * app/api/provision/route.ts — Cloud tenant provisioning engine.
 *
 * Triggered by the Stripe webhook after a successful Cloud checkout (see
 * app/api/webhooks/stripe/route.ts). Spins up a dedicated Fly Machine
 * running Headscale for the tenant, isolated by its own Fly App + volume.
 *
 * This used to be a mock that faked a URL and an API key instantly. It now
 * makes real Fly.io API calls — but provisioning is genuinely async (the
 * Fly Machine has to boot, and the Headscale API key is minted from inside
 * the container and phoned home via app/api/provision/callback). Callers
 * should treat a 200 here as "provisioning started", not "ready" — poll
 * HeadscaleInstance.status (flipped to 'active' by the callback or
 * app/api/cron/cloud-status) to know when a tenant can actually use it.
 *
 * If FLY_API_TOKEN isn't configured, this fails honestly (status: 'error')
 * instead of pretending to succeed — see the audit note in lib/fly.ts.
 */

function flySafeName(tenantId: string): string {
  return `lavamesh-${tenantId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`;
}

// Security: Only allow internal services (like Stripe webhooks) to call this
export async function POST(req: Request) {
  let tenantId: string | undefined;
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.PROVISIONING_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    tenantId = body.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (!flyConfigured()) {
      await prisma.headscaleInstance.upsert({
        where: { tenantId },
        create: { tenantId, url: '', apiKey: '', status: 'error', errorMessage: 'Cloud provisioning isn\u2019t wired up yet (FLY_API_TOKEN missing) — the infrastructure is still being built.' },
        update: { status: 'error', errorMessage: 'Cloud provisioning isn\u2019t wired up yet (FLY_API_TOKEN missing) — the infrastructure is still being built.' },
      });
      console.error('[Provisioning] FLY_API_TOKEN not set — cannot provision tenant', tenantId);
      return NextResponse.json({ error: "Cloud infrastructure not yet configured" }, { status: 503 });
    }

    const appName = flySafeName(tenantId);
    const region = process.env.FLY_REGION || 'iad';
    const serverUrl = `https://${appName}.fly.dev`;
    const baseDomain = `${appName}.lavamesh.internal`;
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'https://www.lavamesh.com'}/api/provision/callback`;

    console.log(`[Provisioning] Creating Fly app ${appName} for tenant ${tenantId} in ${region}...`);
    await createFlyApp(appName);
    await allocateSharedIpv4(appName);
    const volume = await createVolume(appName, 'headscale_data', region, 1);

    const machine = await createMachine({
      appName,
      name: `${appName}-hs`,
      region,
      volumeId: volume.id,
      env: { TZ: 'UTC' },
      files: [
        { guestPath: '/etc/headscale/config.yaml', content: buildHeadscaleConfig({ serverUrl, baseDomain }) },
        { guestPath: '/etc/headscale/bootstrap.sh', content: buildBootstrapScript({ tenantId, callbackUrl, provisioningSecret: process.env.PROVISIONING_SECRET || '' }) },
      ],
      entrypoint: ['/bin/sh'],
      cmd: ['/etc/headscale/bootstrap.sh'],
    });

    console.log(`[Provisioning] Machine ${machine.id} created for ${appName}, awaiting boot + apikey callback`);

    const instance = await prisma.headscaleInstance.upsert({
      where: { tenantId },
      create: {
        tenantId,
        url: serverUrl,
        apiKey: '',
        status: 'provisioning',
        flyAppName: appName,
        flyMachineId: machine.id,
        flyVolumeId: volume.id,
        region,
        errorMessage: null,
      },
      update: {
        url: serverUrl,
        status: 'provisioning',
        flyAppName: appName,
        flyMachineId: machine.id,
        flyVolumeId: volume.id,
        region,
        errorMessage: null,
      },
    });

    return NextResponse.json({ success: true, instance: { status: instance.status, url: instance.url } });
  } catch (error: any) {
    console.error("[Provisioning Error]", error);
    if (tenantId) {
      await prisma.headscaleInstance.upsert({
        where: { tenantId },
        create: { tenantId, url: '', apiKey: '', status: 'error', errorMessage: error?.message || 'Unknown provisioning error' },
        update: { status: 'error', errorMessage: error?.message || 'Unknown provisioning error' },
      }).catch(() => {});
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
