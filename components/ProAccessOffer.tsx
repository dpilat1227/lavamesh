'use client';
import { useState } from 'react';

/**
 * Free Pro, granted personally in exchange for feedback — not a self-serve
 * trial. Same "no card, no cost" feel for the visitor, but every grant comes
 * with a reply attached, so it doubles as the validation loop instead of
 * just handing out silent trials nobody learns anything from.
 */
export default function ProAccessOffer() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/pro-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Try again.');
      setStatus('error');
    }
  };

  return (
    <div className="mt-6" style={{ maxWidth: 640, margin: '24px auto 0' }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: '24px 28px',
        }}
      >
        <p className="text-[13px] font-semibold mb-1" style={{ color: 'white' }}>
          Running this for a team, clients, or multiple sites? Get Pro free.
        </p>
        <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          I'll set you up with a full Pro license, no card, in exchange for telling me what's actually
          missing after you've used it a bit. A reply is fine — a 20-minute call is even better.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[10px]"
            style={{ background: 'rgba(61,220,132,0.08)', border: '1px solid rgba(61,220,132,0.15)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3ddc84', flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] font-medium" style={{ color: '#3ddc84' }}>
              Got it — I'll email you directly, usually within a day.
            </span>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                placeholder="you@company.com"
                required
                className="flex-1 px-3.5 py-2.5 rounded-[9px] text-[13px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: status === 'error' ? '1px solid rgba(255,115,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What you're using it for (optional)"
                className="flex-1 px-3.5 py-2.5 rounded-[9px] text-[13px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn text-[13px] font-semibold whitespace-nowrap"
                style={{
                  padding: '10px 18px',
                  borderRadius: '9px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.14)',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Sending…' : 'Request access →'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-[11.5px]" style={{ color: 'rgba(255,115,0,0.8)' }}>{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
