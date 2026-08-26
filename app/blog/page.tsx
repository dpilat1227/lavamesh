import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/marketing/SiteNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { getAllPostsSorted } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog · LavaMesh',
  description: 'Notes on self-hosted networking, Headscale, Tailscale alternatives, and running your own mesh VPN — written by the person building LavaMesh.',
  alternates: { canonical: 'https://www.lavamesh.com/blog' },
  openGraph: {
    title: 'Blog · LavaMesh',
    description: 'Notes on self-hosted networking, Headscale, and running your own mesh VPN.',
    url: 'https://www.lavamesh.com/blog',
    type: 'website',
  },
};

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function BlogIndexPage() {
  const posts = getAllPostsSorted();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <SiteNav />

      <section style={{ paddingTop: 140, paddingBottom: 40, padding: '140px 24px 40px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,115,0,0.8)' }}>The Blog</p>
          <h1 className="font-bold tracking-tight mb-5" style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.03em', color: 'white' }}>
            Notes on self-hosted networking.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 560, lineHeight: 1.6 }}>
            Headscale, Tailscale, WireGuard, and what it actually takes to run your own mesh VPN — written as I build LavaMesh, not by a content team.
          </p>
        </div>
      </section>

      <section style={{ padding: '20px 24px 120px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block py-7 lift-on-hover"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {post.tags.map(t => (
                  <span key={t} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: '#ff7300', background: 'rgba(255,115,0,0.1)' }}>{t}</span>
                ))}
              </div>
              <h2 className="font-semibold mb-2" style={{ fontSize: 'clamp(19px, 2.5vw, 23px)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {post.title}
              </h2>
              <p className="text-[14.5px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 620 }}>
                {post.description}
              </p>
              <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {formatDate(post.date)} · {post.readTime}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
