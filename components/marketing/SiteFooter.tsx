import Link from 'next/link';

const LINKS = [
  { label: 'Features', href: '/#features', external: false },
  { label: 'Blog', href: '/blog', external: false },
  { label: 'Login', href: '/login', external: false },
  { label: 'GitHub', href: 'https://github.com/dpilat1227/lavamesh', external: true },
  { label: 'Headscale', href: 'https://headscale.net', external: true },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: 'clamp(32px, 5vw, 48px) 24px' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.35)' }}
          >
            <svg className="w-4 h-4" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div>
            <span className="text-[14px] font-semibold block leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>LavaMesh</span>
            {/* Headscale used to appear both here and in the link row. It's a
                link, so it lives in the link row only. */}
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.42)' }}>Built on WireGuard · Self-hosted</span>
          </div>
        </div>

        <nav className="flex items-center flex-wrap gap-x-6 gap-y-2">
          {LINKS.map(link =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-[13px]"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="footer-link text-[13px]">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      <div style={{ maxWidth: 1100, margin: '24px auto 0', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} LavaMesh · Not affiliated with Tailscale. Headscale is an independent open-source project.
        </p>
      </div>
    </footer>
  );
}
