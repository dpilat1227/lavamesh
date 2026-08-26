import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailFrom } from "@/lib/email";

/**
 * app/api/provision/callback/route.ts — Cloud Machine "I'm ready" webhook.
 *
 * Called from inside a tenant's Fly Machine (see lib/headscaleConfig.ts
 * `buildBootstrapScript`) once Headscale is healthy and an admin API key has
 * been minted. This is the only way the API key reaches us — Headscale's own
 * API requires a key to authenticate, so it can't hand one out over HTTP.
 *
 * Authenticated with the same PROVISIONING_SECRET used for /api/provision,
 * since both are internal, server-to-server calls.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.PROVISIONING_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, apiKey } = await req.json();
    if (!tenantId || !apiKey) {
      return NextResponse.json({ error: "tenantId and apiKey are required" }, { status: 400 });
    }

    const instance = await prisma.headscaleInstance.update({
      where: { tenantId },
      data: { apiKey, status: 'active', provisionedAt: new Date(), errorMessage: null },
    });

    console.log(`[Provisioning] Tenant ${tenantId} is now active at ${instance.url}`);
    notifyOwnerInstanceReady(tenantId).catch(e => console.warn('[Provisioning] Ready-notification failed:', e));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Provisioning Callback Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function notifyOwnerInstanceReady(tenantId: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const owner = await prisma.tenantUser.findFirst({ where: { tenantId, role: 'OWNER' }, include: { user: true } });
  const email = owner?.user?.email;
  if (!email) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: emailFrom('LavaMesh Cloud <alerts@lavamesh.com>'),
      to: [email],
      subject: '🔥 Your LavaMesh Cloud instance is ready',
      html: `
        <div style="font-family:sans-serif;max-width:480px;padding:32px;">
          <h2 style="color:#ff7300;margin:0 0 8px;">Your Cloud instance is live.</h2>
          <p style="color:#444;line-height:1.6;margin:0 0 24px;">
            We finished provisioning your dedicated Headscale instance. Head back to your dashboard —
            it'll pick it up automatically, no config needed.
          </p>
          <a href="${process.env.NEXTAUTH_URL || 'https://www.lavamesh.com'}/dashboard" style="display:inline-block;background:#ff7300;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Open Dashboard →</a>
        </div>
      `,
    }),
  }).catch(() => {});
}
