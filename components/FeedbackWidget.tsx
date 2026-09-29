'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal, ModalHeader, Button } from './ui';

type FeedbackType = 'bug' | 'idea' | 'confusing';

const TYPES: { id: FeedbackType; label: string; hint: string }[] = [
  { id: 'bug', label: 'Bug', hint: 'What did you expect, and what happened instead?' },
  { id: 'idea', label: 'Idea', hint: "What would you want it to do?" },
  { id: 'confusing', label: 'Confusing', hint: 'What did you expect this to mean?' },
];

/**
 * In-dashboard feedback.
 *
 * Two deliberate departures from the usual widget:
 *
 * 1. Diagnostics are shown in full and can be switched off. The standard
 *    pattern silently attaches page/session/UA context, which is a bad look for
 *    an audience that self-hosts specifically so nothing phones home. Showing
 *    exactly what gets sent costs one disclosure row and buys the trust that
 *    makes people actually use it.
 * 2. It's addressed from a person, and `reply_to` is set to the sender, so a
 *    reply lands in their inbox. Beta feedback dies when it feels like it went
 *    into a ticket queue.
 */
export default function FeedbackWidget({
  planTier,
  controlHost,
  health,
}: {
  planTier?: string;
  controlHost?: string;
  health?: 'unknown' | 'ok' | 'down';
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [shareDiagnostics, setShareDiagnostics] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, string>>({});

  // Built on open so the page and viewport reflect where they actually hit the
  // problem, not where they were when the app first mounted.
  useEffect(() => {
    if (!open) return;
    setDiagnostics({
      Page: pathname || '/',
      Plan: planTier || 'community',
      'Control plane': controlHost || 'unknown',
      'Control plane reachable': health === 'ok' ? 'yes' : health === 'down' ? 'no' : 'unchecked',
      Viewport: typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '',
      Browser: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  }, [open, pathname, planTier, controlHost, health]);

  // The audience lives on a keyboard. Cmd/Ctrl+Shift+F, avoiding the browser's
  // own find shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => {
    setOpen(false);
    // Reset only after the modal is gone, so the closing frame doesn't flash
    // an empty form.
    setTimeout(() => {
      setMessage('');
      setError('');
      setSent(false);
      setType('bug');
      setShowDiagnostics(false);
    }, 200);
  };

  const submit = async () => {
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          email: email.trim() || undefined,
          diagnostics: shareDiagnostics ? diagnostics : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setSent(true);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    }
    setPending(false);
  };

  const activeHint = TYPES.find(t => t.id === type)!.hint;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-item focus-ring w-full"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        title="Send feedback (⌘⇧F)"
      >
        <span style={{ color: 'var(--text-4)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span>Feedback</span>
      </button>

      <Modal open={open} onClose={pending ? () => {} : close} maxWidth={440} labelledBy="feedback-title">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-11 h-11 rounded-[14px] mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--green-soft)', border: '1px solid rgba(61,220,132,0.25)', color: 'var(--green)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 id="feedback-title" className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>Got it.</h2>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-3)' }}>
              This landed in my inbox, not a ticket queue. If you left an email I&apos;ll probably reply.
            </p>
            <Button variant="ghost" onClick={close} className="justify-center">Close</Button>
          </div>
        ) : (
          <>
            <ModalHeader id="feedback-title" title="Send feedback" onClose={close} />
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-3)', marginTop: -4 }}>
              Straight to me — Drew. Broken things are the most useful thing you can send.
            </p>

            <div className="flex gap-2">
              {TYPES.map(t => {
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className="focus-ring flex-1 py-2 rounded-[9px] text-[12.5px] font-medium transition-all"
                    style={{
                      background: active ? 'rgba(255,115,0,0.14)' : 'var(--surface-3)',
                      border: `1px solid ${active ? 'rgba(255,115,0,0.4)' : 'var(--border-2)'}`,
                      color: active ? '#ff7300' : 'var(--text-2)',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={activeHint}
              rows={5}
              autoFocus
              className="input text-[13px]"
              style={{ resize: 'vertical', lineHeight: 1.55 }}
            />

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email (optional, so I can reply)"
              className="input text-[13px]"
            />

            {/* Transparency about what's attached — see component docblock. */}
            <div className="rounded-[10px]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={shareDiagnostics}
                    onChange={e => setShareDiagnostics(e.target.checked)}
                    style={{ accentColor: '#ff7300', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span className="text-[12.5px]" style={{ color: 'var(--text-2)' }}>Attach page &amp; browser details</span>
                </label>
                <button
                  onClick={() => setShowDiagnostics(v => !v)}
                  className="text-[11.5px] flex-shrink-0"
                  style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {showDiagnostics ? 'Hide' : 'Show'}
                </button>
              </div>
              {showDiagnostics && (
                <div className="px-3 pb-3 space-y-1" style={{ borderTop: '1px solid var(--border-1)', paddingTop: 10 }}>
                  {Object.entries(diagnostics).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-[11px]">
                      <span className="flex-shrink-0" style={{ color: 'var(--text-4)', minWidth: 128 }}>{k}</span>
                      <span className="min-w-0 break-all" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{v || '—'}</span>
                    </div>
                  ))}
                  <p className="text-[11px] pt-1.5" style={{ color: 'var(--text-4)' }}>
                    That&apos;s everything. No node names, no IPs, no keys.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-[12px] px-3 py-2 rounded-[8px]" role="alert" style={{ color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</p>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={close} disabled={pending} className="flex-1 justify-center">Cancel</Button>
              <Button variant="primary" onClick={submit} disabled={pending || message.trim().length < 3} className="flex-1 justify-center">
                {pending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
