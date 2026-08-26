'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginForm({
  allowPassword,
  devPasswordOpen,
}: {
  allowPassword: boolean;
  devPasswordOpen: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'magic' | 'password'>(allowPassword ? 'password' : 'magic');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'password') {
      const res = await signIn('password', { email, password, redirect: false, callbackUrl: '/dashboard' });
      setLoading(false);
      if (res?.error || !res?.ok) {
        setError(devPasswordOpen ? 'Could not sign in. Check the email and try again.' : 'Wrong password, or password login is not configured.');
        return;
      }
      window.location.href = res.url || '/dashboard';
      return;
    }

    const res = await signIn('email', { email, redirect: false, callbackUrl: '/dashboard' });
    setLoading(false);
    if (res?.error) {
      setError('Failed to send magic link. Please try again.');
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-mesh absolute" style={{ top: '-20%', left: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(255,90,0,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="animate-mesh absolute" style={{ bottom: '-20%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255,90,0,0.07) 0%, transparent 70%)', borderRadius: '50%', animationDelay: '-10s' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="animate-scale-in w-full max-w-[380px] mx-4 relative z-10">
        <div className="glass-strong rounded-[20px] p-8" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(255,90,0,0.06)' }}>
          <div className="flex flex-col items-center mb-8">
            <div className="animate-float mb-5">
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a0802 0%, #3a1405 100%)', border: '1px solid rgba(255,90,0,0.35)', boxShadow: '0 0 30px rgba(255,90,0,0.25), 0 0 0 6px rgba(255,90,0,0.05)' }}
              >
                <svg className="w-7 h-7" style={{ color: '#FF5A00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
            </div>
            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>LavaMesh</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Admin Dashboard</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '38px' }}
                  autoFocus
                />
              </div>

              {mode === 'password' && (
                <input
                  type="password"
                  placeholder={devPasswordOpen ? 'Any password in local dev' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  autoComplete="current-password"
                />
              )}

              {error && (
                <div className="animate-fade-in flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--red-soft)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || (mode === 'password' && !password)}
                className="btn btn-primary w-full justify-center"
                style={{ padding: '11px 16px', fontSize: '14px', borderRadius: '12px', opacity: (!email || loading || (mode === 'password' && !password)) ? 0.6 : 1 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mode === 'password' ? 'Signing in…' : 'Sending link…'}
                  </>
                ) : mode === 'password' ? 'Sign in' : 'Continue with Email'}
              </button>

              {allowPassword && (
                <button
                  type="button"
                  onClick={() => { setMode(m => m === 'password' ? 'magic' : 'password'); setError(''); }}
                  className="w-full text-center text-[12px] py-1"
                  style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer' }}
                >
                  {mode === 'password' ? 'Use a magic link instead' : 'Sign in with a password'}
                </button>
              )}
            </form>
          ) : (
            <div className="text-center animate-fade-in">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-2">Check your email</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-4)' }}>
                We sent a magic link to <strong className="text-white font-medium">{email}</strong>. Click it to sign in.
              </p>
            </div>
          )}

          <p className="text-center text-[11px] mt-5" style={{ color: 'var(--text-4)' }}>
            LavaMesh Control Plane
          </p>
        </div>
      </div>
    </div>
  );
}
