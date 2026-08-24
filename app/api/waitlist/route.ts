import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'drew@lavamesh.com';

    if (!resendKey) {
      // Dev mode — just log and succeed (set RESEND_API_KEY in Vercel to activate)
      console.log(`[waitlist] New signup: ${email}`);
      return NextResponse.json({ ok: true });
    }

    // Notify admin via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LavaMesh Waitlist <waitlist@lavamesh.com>',
        to: [adminEmail],
        subject: `🔥 New Cloud waitlist signup: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:32px;">
            <h2 style="color:#FF5A00;margin:0 0 8px;">New waitlist signup</h2>
            <p style="color:#666;margin:0 0 24px;">Someone just joined the LavaMesh Cloud waitlist.</p>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;">
              <strong>Email:</strong> ${email}
            </div>
            <p style="color:#999;font-size:12px;margin-top:24px;">Sent from lavamesh.com</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json().catch(() => ({}));
      console.error('[waitlist] Resend error:', err);
      // Don't expose Resend errors to client
      return NextResponse.json({ ok: true });
    }

    // Also send a confirmation to the subscriber (best-effort — don't fail the request if this errors)
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Drew at LavaMesh <drew@lavamesh.com>',
          to: [email],
          subject: "You're on the LavaMesh Cloud waitlist 🔥",
          html: `
            <div style="font-family:sans-serif;max-width:480px;padding:32px;">
              <h2 style="color:#FF5A00;margin:0 0 8px;">You're on the list.</h2>
              <p style="color:#444;line-height:1.6;margin:0 0 16px;">
                Thanks for joining the <strong>LavaMesh Cloud</strong> waitlist. 
                We're building a fully managed option — you bring your devices, 
                we handle the Headscale server, backups, and uptime.
              </p>
              <p style="color:#444;line-height:1.6;margin:0 0 24px;">
                We'll reach out personally when Cloud is ready for early access. 
                You'll be first in line.
              </p>
              <a href="https://lavamesh.com" style="display:inline-block;background:#FF5A00;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                View LavaMesh →
              </a>
              <p style="color:#999;font-size:12px;margin-top:32px;">
                LavaMesh · Self-hosted mesh networking
              </p>
            </div>
          `,
        }),
      });
    } catch (confirmErr) {
      console.warn('[waitlist] Confirmation email failed (domain may not be verified yet):', confirmErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[waitlist] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
