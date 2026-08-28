import { NextRequest, NextResponse } from 'next/server';
import { emailFrom } from '@/lib/email';

/**
 * "Free Pro for feedback" requests from the marketing pricing section
 * (components/ProAccessOffer.tsx). Deliberately not wired to license
 * issuance — every grant is a human reply from Drew, not an automated
 * unlock, since the point is the conversation, not the trial itself.
 * No DB write: at this volume, the founder's inbox is the CRM.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, note } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : '';

    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'drew@lavamesh.com';

    if (!resendKey) {
      console.log(`[pro-access] Request from ${email}: ${cleanNote || '(no note)'}`);
      return NextResponse.json({ ok: true });
    }

    const notifyRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailFrom('LavaMesh <alerts@lavamesh.com>'),
        to: [adminEmail],
        reply_to: email,
        subject: `🎁 Free Pro request: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:32px;">
            <h2 style="color:#ff7300;margin:0 0 8px;">Free Pro request</h2>
            <p style="color:#666;margin:0 0 20px;">Someone asked for a free Pro license from the pricing page.</p>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;">
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
              <p style="margin:0;"><strong>Using it for:</strong> ${cleanNote || '<em>not provided</em>'}</p>
            </div>
            <p style="color:#999;font-size:12px;margin-top:24px;">Reply-to is set to their address — hit reply.</p>
          </div>
        `,
      }),
    }).catch(() => null);

    if (!notifyRes || !notifyRes.ok) {
      console.error('[pro-access] Resend notify failed', notifyRes ? await notifyRes.text().catch(() => '') : 'network error');
      // Still tell the visitor it worked — don't make them retry over an email hiccup.
      return NextResponse.json({ ok: true });
    }

    // Best-effort confirmation so they're not left wondering if it went anywhere.
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: emailFrom('Drew at LavaMesh <alerts@lavamesh.com>'),
          to: [email],
          subject: "Got your request — I'll set you up",
          html: `
            <div style="font-family:sans-serif;max-width:480px;padding:32px;">
              <p style="color:#444;line-height:1.6;margin:0 0 16px;">Hey — got your request for a free Pro license.</p>
              <p style="color:#444;line-height:1.6;margin:0 0 16px;">
                I'll reply from this address directly with your license key, usually within a day.
                No card, no catch — just tell me honestly what's missing once you've used it a bit.
              </p>
              <p style="color:#444;line-height:1.6;margin:0;">— Drew</p>
            </div>
          `,
        }),
      }).catch(() => null);
    } catch {
      // Non-fatal — the admin notification already went through.
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pro-access] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
