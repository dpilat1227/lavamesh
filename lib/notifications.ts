/**
 * lib/notifications.ts — Alerting config + delivery.
 *
 * Email alerts (Resend, to ADMIN_EMAIL or a configured override) are available
 * to everyone — they're basic ops, not a paywalled feature. Webhook alerts
 * (Slack/Discord) are the Pro perk called out in the pricing table, so callers
 * should gate `saveNotificationConfig`'s webhook fields behind `isPro` before
 * letting a user enable them (see app/actions.ts). `sendWebhookAlert` itself
 * doesn't re-check plan status — it just fires whatever URL is stored, on the
 * assumption gating happened at write-time.
 *
 * Config is stored in KV (same pattern as lib/apikeys.ts / lib/audit.ts) since
 * this app otherwise has no per-admin settings table.
 */

import { kvGet, kvSet } from '@/lib/kv';

export interface NotificationConfig {
  emailEnabled: boolean;
  email: string;        // overrides ADMIN_EMAIL when set
  webhookEnabled: boolean;
  webhookUrl: string;   // Slack or Discord incoming-webhook URL
}

const CONFIG_KEY = 'notifications:config';

const DEFAULTS: NotificationConfig = {
  emailEnabled: true,
  email: '',
  webhookEnabled: false,
  webhookUrl: '',
};

export async function getNotificationConfig(): Promise<NotificationConfig> {
  const stored = await kvGet<Partial<NotificationConfig>>(CONFIG_KEY);
  return { ...DEFAULTS, ...stored };
}

export async function saveNotificationConfig(patch: Partial<NotificationConfig>): Promise<NotificationConfig> {
  const next = { ...(await getNotificationConfig()), ...patch };
  await kvSet(CONFIG_KEY, next);
  return next;
}

async function deliverEmail(subject: string, html: string, config: NotificationConfig): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const to = config.emailEnabled ? (config.email || process.env.ADMIN_EMAIL) : null;
  if (!resendKey || !to) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'LavaMesh Alerts <alerts@lavamesh.com>',
      to: [to],
      subject,
      html,
    }),
  }).catch(() => {});
}

async function deliverWebhook(text: string, config: NotificationConfig): Promise<void> {
  if (!config.webhookEnabled || !config.webhookUrl) return;
  const isDiscord = config.webhookUrl.includes('discord.com');
  const body = isDiscord ? { content: text } : { text };
  await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

function emailShell(heading: string, accentColor: string, bodyHtml: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #e5e5e5; border-radius: 16px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
        <span style="font-size: 24px;">🔥</span>
        <span style="font-size: 18px; font-weight: 700; color: #fff;">LavaMesh</span>
      </div>
      <h2 style="color: ${accentColor}; font-size: 20px; margin: 0 0 12px;">${heading}</h2>
      ${bodyHtml}
      <a href="https://www.lavamesh.com/dashboard" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #FF5A00; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard →</a>
    </div>
  `;
}

/** Send a node-offline alert for one or more nodes, via whichever channels are configured. */
export async function sendOfflineAlert(nodes: { name: string; ip: string }[]): Promise<void> {
  if (nodes.length === 0) return;
  const config = await getNotificationConfig();
  const list = nodes.map(n => `• ${n.name} (${n.ip}) went offline`);

  await Promise.all([
    deliverEmail(
      `⚠️ ${nodes.length} node${nodes.length > 1 ? 's' : ''} went offline — LavaMesh`,
      emailShell(
        'Node Offline Alert',
        '#f87171',
        `<p style="color: #a3a3a3; margin: 0 0 20px;">${list.map(l => `${l}<br/>`).join('')}</p><p style="color: #737373; font-size: 13px;">Check your dashboard for more details.</p>`
      ),
      config
    ),
    deliverWebhook(`⚠️ **Node offline** — ${list.join(' · ')}`, config),
  ]);
}

/** Send a pre-auth key expiring-soon alert. */
export async function sendKeyExpiringAlert(keys: { user: string; keyPrefix: string; expiresAt: string }[]): Promise<void> {
  if (keys.length === 0) return;
  const config = await getNotificationConfig();
  const list = keys.map(k => `• Key ${k.keyPrefix}… (user: ${k.user}) expires ${new Date(k.expiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);

  await Promise.all([
    deliverEmail(
      `⏰ ${keys.length} pre-auth key${keys.length > 1 ? 's' : ''} expiring soon — LavaMesh`,
      emailShell(
        'Key Expiring Soon',
        '#fbbf24',
        `<p style="color: #a3a3a3; margin: 0 0 20px;">${list.map(l => `${l}<br/>`).join('')}</p><p style="color: #737373; font-size: 13px;">Generate a replacement key before it expires to avoid disruption.</p>`
      ),
      config
    ),
    deliverWebhook(`⏰ **Key(s) expiring soon** — ${list.join(' · ')}`, config),
  ]);
}
