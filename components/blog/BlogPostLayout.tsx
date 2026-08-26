import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/marketing/SiteNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { ArticleCTA } from '@/components/blog/Prose';
import { getPublishedPosts, type BlogPost } from '@/lib/blog';

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function BlogPostLayout({ post, children }: { post: BlogPost; children: ReactNode }) {
  const related = getPublishedPosts().filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <SiteNav />

      <article style={{ paddingTop: 128, paddingBottom: 100 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-8"
            style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            All posts
          </Link>

          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {post.tags.map(t => (
              <span key={t} className="text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ color: '#ff7300', background: 'rgba(255,115,0,0.1)' }}>{t}</span>
            ))}
          </div>

          <h1 className="font-bold mb-6" style={{ fontSize: 'clamp(30px, 5vw, 44px)', letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15 }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-12 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Image src="/drew_headshot.jpg" alt="Drew Pilat" fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Drew Pilat</div>
              <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatDate(post.date)} · {post.readTime}</div>
            </div>
          </div>

          {children}

          <ArticleCTA />

          {related.length > 0 && (
            <div className="mt-16 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-[12px] font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Keep reading</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {related.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="block p-5 rounded-[14px] lift-on-hover"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
                    <div className="text-[15px] font-semibold mb-2" style={{ color: 'white', lineHeight: 1.4 }}>{p.title}</div>
                    <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.readTime}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
