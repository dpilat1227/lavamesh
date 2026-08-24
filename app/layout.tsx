import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'LavaMesh · Private Mesh Networking',
  description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. No subscriptions. Flat-rate pricing.',
  metadataBase: new URL('https://www.lavamesh.com'),
  openGraph: {
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. No subscriptions.',
    url: 'https://www.lavamesh.com',
    siteName: 'LavaMesh',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'LavaMesh — Private Mesh Networking' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. No subscriptions.',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          background: 'var(--bg)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Ambient background orb */}
        <div
          className="pointer-events-none fixed"
          style={{
            top: '-15%', left: '-10%',
            width: '50%', height: '50%',
            background: 'radial-gradient(circle, rgba(255,90,0,0.07) 0%, transparent 65%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <MainLayout>{children}</MainLayout>
        </div>
      </body>
    </html>
  );
}
