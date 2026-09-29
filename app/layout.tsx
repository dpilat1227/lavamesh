import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import MainLayout from '@/components/MainLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureTenantForUser } from '@/lib/tenant';
import { headscaleLoginServer } from '@/lib/headscale';

export const metadata: Metadata = {
  title: 'LavaMesh · Private Mesh Networking',
  description: 'Free, self-hosted dashboard for Headscale. Nodes, keys, routes, and ACLs for the mesh you already run.',
  metadataBase: new URL('https://www.lavamesh.com'),
  applicationName: 'LavaMesh',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  openGraph: {
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Free, self-hosted dashboard for Headscale. Nodes, keys, routes, and ACLs for the mesh you already run.',
    url: 'https://www.lavamesh.com',
    siteName: 'LavaMesh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Free, self-hosted dashboard for Headscale. Nodes, keys, routes, and ACLs for the mesh you already run.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Anonymous requests (marketing site, /login) never reach the DB: getServerSession
  // resolves to null with no session cookie, so plan lookup is skipped entirely below —
  // this stays cheap on every page load, not just dashboard routes.
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as any)?.id as string | undefined;
  if (userId) {
    await ensureTenantForUser(userId, { email: session?.user?.email, name: session?.user?.name }).catch(() => null);
  }
  // Only worth resolving (and worth a DB round-trip) once a user is actually
  // signed in — anonymous marketing-site requests skip it entirely.
  const controlHost = userId
    ? await headscaleLoginServer().then(u => u.replace(/^https?:\/\//, '').replace(/\/$/, '')).catch(() => 'api.lavamesh.com')
    : 'api.lavamesh.com';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured data for search engines — helps LavaMesh show up correctly
            for "Tailscale alternative" / "Headscale UI" style queries. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'LavaMesh',
              applicationCategory: 'SecurityApplication',
              operatingSystem: 'Linux, macOS, Windows, Docker',
              description:
                'Free, self-hosted dashboard for Headscale. Nodes, keys, routes, and ACLs for the mesh you already run.',
              url: 'https://www.lavamesh.com',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
      </head>
      <body
        className="antialiased"
        style={{
          background: 'var(--bg)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <MainLayout controlHost={controlHost}>{children}</MainLayout>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
