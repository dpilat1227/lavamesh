import { NextResponse } from "next/server";
import { hasLicenseKey } from "@/lib/billing";
import { createBackup } from "@/lib/backups";
import { logEvent } from "@/lib/audit";

/**
 * app/api/cron/config-backup/route.ts — the "Automated" half of "Automated
 * config backups" (see lib/backups.ts for the full feature writeup).
 * Runs daily on Vercel Cron (see vercel.json). Only self-hosted Pro
 * (license-key) instances are covered here today — Cloud tenants are
 * single-admin per Fly Machine already, so once Cloud is live this should
 * loop tenants with an active Cloud subscription and back up each one
 * against its own HeadscaleInstance instead of the single global KV used
 * for self-hosted Community/Pro (see lib/notifications.ts for the same
 * single-tenant assumption elsewhere in this app).
 */
export async function GET() {
  if (!(await hasLicenseKey())) {
    return NextResponse.json({ skipped: true, reason: 'No Pro license key configured' });
  }

  try {
    const summary = await createBackup('scheduled');
    await logEvent('backup.create', { trigger: 'scheduled', nodes: String(summary.nodeCount), users: String(summary.userCount) });
    return NextResponse.json({ success: true, summary });
  } catch (e: any) {
    console.error('[cron/config-backup] Failed:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
