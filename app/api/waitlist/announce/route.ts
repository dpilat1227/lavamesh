import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailFrom } from '@/lib/email';
import { kvGet, kvSet } from '@/lib/kv';
import { cloudBetaCap, countCloudTenants } from '@/lib/cloud';

const SENT_KEY = 'waitlist:cloud-open:sent';

/**
 * Email the waitlist that Cloud is open, capped to remaining beta seats.
 * POST with Authorization: Bearer CRON_SECRET
 */
export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 503 });
  }

  const already = (await kvGet<string[]>(SENT_KEY)) || [];
  const sentSet = new Set(already);
  const seatsLeft = Math.max(0, cloudBetaCap() - (await countCloudTenants()));
  if (seatsLeft === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'beta full' });
  }

  const rows = await prisma.waitlist.findMany({ orderBy: { createdAt: 'asc' } });
  const targets = rows.map(r => r.email).filter(e => !sentSet.has(e)).slice(0, seatsLeft);

  const sent: string[] = [];
  for (const email of targets) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom('Drew at LavaMesh <alerts@lavamesh.com>'),
        to: [email],
        subject: 'LavaMesh Cloud is open — limited first wave',
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:32px;">
            <h2 style="color:#ff7300;margin:0 0 8px;">Cloud is open.</h2>
            <p style="color:#444;line-height:1.6;margin:0 0 16px;">
              You asked to hear when we host the network for you. That&apos;s now.
              Sign in, pay $39/month, add a phone. No VPS.
            </p>
            <p style="color:#444;line-height:1.6;margin:0 0 24px;">
              First wave is capped so I can actually be on the hook if something breaks.
            </p>
            <a href="https://www.lavamesh.com/api/checkout?plan=cloud" style="display:inline-block;background:#ff7300;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
              Start Cloud →
            </a>
            <p style="color:#999;font-size:12px;margin-top:32px;">Drew · LavaMesh</p>
          </div>
        `,
      }),
    });
    if (res.ok) sent.push(email);
  }

  await kvSet(SENT_KEY, [...already, ...sent]);
  return NextResponse.json({ ok: true, sent: sent.length, remaining: targets.length - sent.length });
}
