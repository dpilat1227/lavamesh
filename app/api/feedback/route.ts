import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailFrom } from '@/lib/email';
import { kvGet, kvSet } from '@/lib/kv';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  bug: 'Bug',
  idea: 'Idea',
  confusing: 'Confusing',
};

const MAX_MESSAGE = 4000;

/** One submission per user per 20s — enough to stop a stuck submit button from spamming. */
const RATE_WINDOW_SECONDS = 20;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const sessionEmail = (session.user as any)?.email as string | undefined;
  const userId = (session.user as any)?.id || sessionEmail || 'unknown';

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const type = typeof body?.type === 'string' && TYPE_LABEL[body.type] ? body.type : 'idea';
  const message = String(body?.message ?? '').trim();
  const replyTo = String(body?.email ?? '').trim() || sessionEmail || '';
  const diagnostics = body?.diagnostics && typeof body.diagnostics === 'object' ? body.diagnostics : null;

  if (message.length < 3) {
    return NextResponse.json({ error: 'Tell us a bit more than that.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'That is longer than we can accept. Trim it down a bit.' }, { status: 400 });
  }

  const rateKey = `feedback:rate:${userId}`;
  if (await kvGet<number>(rateKey)) {
    return NextResponse.json({ error: 'Just a moment — that was sent. Try again shortly.' }, { status: 429 });
  }
  await kvSet(rateKey, 1, { ex: RATE_WINDOW_SECONDS });

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'drew@lavamesh.com';

  if (!resendKey) {
    // Local dev / self-hosters without Resend: log it rather than pretend to
    // send. Still a success from the UI's point of view.
    console.log(`[feedback] ${TYPE_LABEL[type]} from ${replyTo || 'anon'}: ${message}`, diagnostics ?? '');
    return NextResponse.json({ ok: true, delivered: false });
  }

  const diagRows = diagnostics
    ? Object.entries(diagnostics)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:12px;white-space:nowrap;">${esc(k)}</td><td style="padding:4px 0;color:#333;font-size:12px;font-family:ui-monospace,monospace;">${esc(String(v))}</td></tr>`,
        )
        .join('')
    : '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: emailFrom('LavaMesh Feedback <alerts@lavamesh.com>'),
      to: [adminEmail],
      // Lets you hit reply and land in the user's inbox directly.
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `[${TYPE_LABEL[type]}] ${message.slice(0, 60).replace(/\s+/g, ' ')}${message.length > 60 ? '…' : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;padding:28px;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#ff7300;font-weight:600;">${esc(TYPE_LABEL[type])}</p>
          <h2 style="margin:0 0 18px;font-size:17px;color:#111;">New dashboard feedback</h2>
          <div style="white-space:pre-wrap;line-height:1.6;color:#222;font-size:14px;padding:16px;background:#f6f6f6;border-radius:10px;">${esc(message)}</div>
          <p style="margin:18px 0 4px;font-size:13px;color:#555;">From: <strong>${esc(replyTo || 'not provided')}</strong></p>
          ${diagRows ? `<table style="margin-top:14px;border-collapse:collapse;">${diagRows}</table>` : '<p style="font-size:12px;color:#999;margin-top:14px;">Diagnostics not shared.</p>'}
        </div>
      `,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    // Surface the failure so the widget can tell the user to email instead of
    // silently eating a bug report.
    console.error('[feedback] Resend delivery failed', res ? await res.text().catch(() => '') : 'network error');
    return NextResponse.json({ error: "Couldn't send that. Email drew@lavamesh.com and I'll pick it up." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
