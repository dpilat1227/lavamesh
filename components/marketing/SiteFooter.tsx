import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[6px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.3)' }}>
            <svg className="w-2.5 h-2.5" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>LavaMesh</span>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>· Headscale · WireGuard · Next.js · Vercel</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Blog</Link>
          <Link href="/login" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Login</Link>
          <a href="https://headscale.net" target="_blank" rel="noopener noreferrer" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Headscale</a>
          <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer" className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>GitHub</a>
        </div>
      </div>
    </footer>
  );
}
