import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMachine, flyConfigured } from "@/lib/fly";

/**
 * app/api/cron/cloud-status/route.ts — Safety net for Cloud provisioning.
 *
 * The happy path is: Machine boots → bootstrap.sh mints an API key → POSTs
 * it to /api/provision/callback → status flips to 'active'. This cron
 * catches the unhappy paths: a Machine that never boots, a callback that
 * never lands (network blip, image doesn't have `wget`, etc.), so a tenant
 * never gets stuck on "provisioning" forever with no explanation.
 *
 * Runs every 5 minutes (see vercel.json). Anything still 'provisioning'
 * after PROVISION_TIMEOUT_MS gets marked 'error' with a message pointing at
 * what to check — most of these will be manual-intervention cases while
 * this integration is new.
 */

const PROVISION_TIMEOUT_MS = 15 * 60 * 1000;

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stuck = await prisma.headscaleInstance.findMany({ where: { status: 'provisioning' } });
  let timedOut = 0;
  let stillWaiting = 0;

  for (const instance of stuck) {
    const ageMs = Date.now() - instance.createdAt.getTime();

    let machineState: string | null = null;
    if (flyConfigured() && instance.flyAppName && instance.flyMachineId) {
      try {
        const machine = await getMachine(instance.flyAppName, instance.flyMachineId);
        machineState = machine.state;
      } catch (e: any) {
        machineState = `lookup-failed: ${e.message}`;
      }
    }

    if (ageMs > PROVISION_TIMEOUT_MS) {
      await prisma.headscaleInstance.update({
        where: { id: instance.id },
        data: {
          status: 'error',
          errorMessage: `Provisioning timed out after ${Math.round(ageMs / 60000)}m (last known Fly Machine state: ${machineState ?? 'unknown'}). Needs manual investigation.`,
        },
      });
      console.error(`[cloud-status] Tenant ${instance.tenantId} timed out (machine state: ${machineState})`);
      timedOut++;
    } else if (machineState === 'destroyed' || machineState?.startsWith('lookup-failed')) {
      await prisma.headscaleInstance.update({
        where: { id: instance.id },
        data: { status: 'error', errorMessage: `Fly Machine is in an unrecoverable state: ${machineState}` },
      });
      timedOut++;
    } else {
      stillWaiting++;
    }
  }

  return NextResponse.json({ checked: stuck.length, timedOut, stillWaiting });
}
