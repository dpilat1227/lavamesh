'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      password,
      redirect: true,
      callbackUrl: '/',
    });
    if (res?.error) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-[#0A0A0A]/90 backdrop-blur-3xl ring-1 ring-white/[0.08] rounded-[24px] shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-[14px] border border-[#ff5a00]/30 bg-gradient-to-br from-[#1a0802] to-[#3a1405] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,90,0,0.2)]">
            <svg className="w-6 h-6 text-[#ff5a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">LavaMesh Admin</h1>
          <p className="text-sm text-neutral-400 mt-1">Enter your password to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-[12px] px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff5a00] transition-colors text-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 text-center">Invalid password. Try "lavamesh2026"</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#ff5a00] hover:bg-[#e04f00] text-white font-medium py-3 rounded-[12px] transition-colors text-sm shadow-lg shadow-orange-500/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
