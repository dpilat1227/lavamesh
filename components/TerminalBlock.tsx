'use client';
import { useEffect, useRef, useState } from 'react';

const COMMAND = `curl -fsSL https://lavamesh.com/api/install.sh?token=lmk_7f2a... | sudo sh`;

export default function TerminalBlock() {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const type = () => {
            if (i <= COMMAND.length) {
              setDisplayed(COMMAND.slice(0, i));
              i++;
              setTimeout(type, i < 10 ? 60 : 28);
            } else {
              setDone(true);
            }
          };
          setTimeout(type, 400);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={ref} className="relative rounded-[16px] overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
        <span className="ml-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>bash — 80×24</span>
      </div>
      {/* Terminal body */}
      <div className="px-5 py-5">
        {/* Prompt line */}
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: 'rgba(52,211,153,0.8)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>drew@lavamesh</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>~</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>$</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {displayed}
            <span style={{ opacity: cursor ? 1 : 0, color: '#FF5A00' }}>▌</span>
          </span>
        </div>

        {/* Output */}
        {done && (
          <div className="space-y-1 mt-2 animate-fade-in">
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Downloading LavaMesh installer...</p>
            <p style={{ color: 'rgba(52,211,153,0.7)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>✓ Tailscale installed</p>
            <p style={{ color: 'rgba(52,211,153,0.7)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>✓ Joining mesh network...</p>
            <p style={{ color: '#FF5A00', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>✓ Connected · 100.64.0.5 assigned</p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(52,211,153,0.8)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>drew@lavamesh</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}> ~ </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>$</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', fontSize: 13 }}> _</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
