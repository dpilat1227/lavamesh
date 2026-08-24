'use client';
import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <section id="waitlist" style={{ padding: '0 24px 140px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '56px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle glow */}
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(circle, rgba(255,90,0,0.06) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            {/* Icon */}
            <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-.965 20.97 20.97 0 0110.02-2.022A20.97 20.97 0 0119 5.036 1 1 0 0120 6z"/>
              </svg>
            </div>

            <h2 className="font-bold tracking-tight mb-2" style={{ fontSize: 28, letterSpacing: '-0.03em', color: 'white' }}>
              LavaMesh Cloud
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,90,0,0.7)' }}>
              Coming soon · Managed hosting
            </p>
            <p className="mb-8 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              We host Headscale and the dashboard for you. No servers, no config files, no ops tax. Just your private mesh — managed.
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-[12px]"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#34d399' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-[14px] font-medium" style={{ color: '#34d399' }}>You&apos;re on the list — we&apos;ll reach out when Cloud launches.</span>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                    placeholder="you@company.com"
                    required
                    className="flex-1 px-4 py-3 rounded-[10px] text-[14px] outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: status === 'error' ? '1px solid rgba(255,90,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,90,0,0.3)')}
                    onBlur={e => (e.currentTarget.style.borderColor = status === 'error' ? 'rgba(255,90,0,0.4)' : 'rgba(255,255,255,0.08)')}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn btn-primary font-semibold whitespace-nowrap"
                    style={{ padding: '12px 20px', borderRadius: '10px', fontSize: 14, opacity: status === 'loading' ? 0.7 : 1 }}
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        Joining...
                      </span>
                    ) : 'Join Waitlist →'}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-[12px]" style={{ color: 'rgba(255,90,0,0.8)' }}>{errorMsg}</p>
                )}
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No spam. Notified when Cloud launches.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
