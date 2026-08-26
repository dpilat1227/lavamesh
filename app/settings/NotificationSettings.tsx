'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveNotificationConfigAction, testNotificationAction } from '@/app/actions';
import type { NotificationConfig } from '@/lib/notifications';
import { Badge, Button, Card } from '@/components/ui';

export default function NotificationSettings({
  config,
  isPro,
  hasResend,
}: {
  config: NotificationConfig;
  isPro: boolean;
  hasResend: boolean;
}) {
  const [form, setForm] = useState(config);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'saved' | 'error' | 'tested'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [testResult, setTestResult] = useState('');
  const isDirty = JSON.stringify(form) !== JSON.stringify(config);
  const router = useRouter();
  const [testing, startTest] = useTransition();

  const test = () => {
    startTest(async () => {
      try {
        const result = await testNotificationAction();
        const bits = [
          result.email ? 'email' : null,
          result.webhook ? 'webhook' : null,
        ].filter(Boolean);
        setTestResult(`Sent via ${bits.join(' + ')}`);
        setStatus('tested');
        setTimeout(() => setStatus('idle'), 4000);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e?.message || 'Test alert failed');
      }
    });
  };

  const save = () => {
    startTransition(async () => {
      try {
        await saveNotificationConfigAction(form);
        setStatus('saved');
        router.refresh();
        setTimeout(() => setStatus('idle'), 3000);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e?.message || 'Failed to save notification settings');
      }
    });
  };

  return (
    <Card padded={false} className="animate-fade-in-up" style={{ animationDelay: '220ms' }}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Alerts &amp; Notifications</h2>
            <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Get notified when a node goes offline, a pre-auth key is about to expire, or a subnet route fails over</p>
          </div>
        </div>

        {!hasResend && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fbbf24', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-[11px]" style={{ color: '#fbbf24' }}>Requires RESEND_API_KEY — email alerts won&apos;t send until it&apos;s set</p>
          </div>
        )}

        {/* Email */}
        <div className="flex items-start justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <div className="flex-1 pr-4">
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-2)' }}>Email alerts</p>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@example.com (leave blank to use ADMIN_EMAIL)"
              disabled={!form.emailEnabled}
              className="input w-full text-[12px] py-1.5 mt-1"
              style={{ opacity: form.emailEnabled ? 1 : 0.5 }}
            />
          </div>
          <button
            role="switch"
            aria-checked={form.emailEnabled}
            aria-label="Toggle email alerts"
            onClick={() => setForm(f => ({ ...f, emailEnabled: !f.emailEnabled }))}
            className="relative flex-shrink-0 mt-0.5"
            style={{ width: 36, height: 20, borderRadius: 10, background: form.emailEnabled ? 'var(--green)' : 'var(--surface-3)', border: '1px solid var(--border-2)', cursor: 'pointer', transition: 'background 0.15s' }}
          >
            <span style={{ position: 'absolute', top: 1, left: form.emailEnabled ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
          </button>
        </div>

        {/* Webhook */}
        <div className="py-3">
          {isPro ? (
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-2)' }}>Webhook alerts</p>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-4)' }}>Slack or Discord incoming-webhook URL</p>
                <input
                  type="url"
                  value={form.webhookUrl}
                  onChange={e => setForm(f => ({ ...f, webhookUrl: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/…"
                  disabled={!form.webhookEnabled}
                  className="input w-full text-[12px] py-1.5"
                  style={{ opacity: form.webhookEnabled ? 1 : 0.5, fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <button
                role="switch"
                aria-checked={form.webhookEnabled}
                aria-label="Toggle webhook alerts"
                onClick={() => setForm(f => ({ ...f, webhookEnabled: !f.webhookEnabled }))}
                className="relative flex-shrink-0 mt-0.5"
                style={{ width: 36, height: 20, borderRadius: 10, background: form.webhookEnabled ? 'var(--green)' : 'var(--surface-3)', border: '1px solid var(--border-2)', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                <span style={{ position: 'absolute', top: 1, left: form.webhookEnabled ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.16)' }}>
              <div>
                <p className="text-[13px] font-medium mb-0.5" style={{ color: 'var(--text-2)' }}>Webhook alerts <Badge variant="orange" className="text-[9px] uppercase tracking-wider ml-1">Pro</Badge></p>
                <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Send node/key alerts to Slack or Discord on the Pro or Cloud plan.</p>
              </div>
              <a href="/#pricing" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
            </div>
          )}
        </div>

        {/* Route failover */}
        <div className="py-3" style={{ borderTop: '1px solid var(--border-1)' }}>
          {isPro ? (
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-2)' }}>Route failover alerts</p>
                <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Notify when a subnet route&apos;s primary node switches to a backup (via your email/webhook channels above)</p>
              </div>
              <button
                role="switch"
                aria-checked={form.failoverAlertsEnabled}
                aria-label="Toggle route failover alerts"
                onClick={() => setForm(f => ({ ...f, failoverAlertsEnabled: !f.failoverAlertsEnabled }))}
                className="relative flex-shrink-0 mt-0.5"
                style={{ width: 36, height: 20, borderRadius: 10, background: form.failoverAlertsEnabled ? 'var(--green)' : 'var(--surface-3)', border: '1px solid var(--border-2)', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                <span style={{ position: 'absolute', top: 1, left: form.failoverAlertsEnabled ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.16)' }}>
              <div>
                <p className="text-[13px] font-medium mb-0.5" style={{ color: 'var(--text-2)' }}>Route failover alerts <Badge variant="orange" className="text-[9px] uppercase tracking-wider ml-1">Pro</Badge></p>
                <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Get notified the moment a subnet route fails over to its backup node.</p>
              </div>
              <a href="/#pricing" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3">
          <div>
            {status === 'saved' && (
              <Badge variant="green" className="animate-fade-in">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Saved
              </Badge>
            )}
            {status === 'tested' && (
              <Badge variant="green" className="animate-fade-in">{testResult || 'Test sent'}</Badge>
            )}
            {status === 'error' && (
              <Badge variant="red" className="animate-fade-in text-[11px] max-w-[300px] truncate">{errorMsg}</Badge>
            )}
            {isDirty && status === 'idle' && (
              <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={test}
              disabled={testing || isDirty}
              className="text-[12px] px-3 py-1.5"
              title={isDirty ? 'Save first, then send a test' : 'Send a test email/webhook'}
            >
              {testing ? 'Sending…' : 'Send test'}
            </Button>
            <Button
              variant="primary"
              onClick={save}
              disabled={isPending || !isDirty}
              className="text-[12px] px-4 py-1.5"
              style={{ opacity: !isDirty ? 0.5 : 1 }}
            >
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
