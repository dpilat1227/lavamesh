import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/MainLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPlanStatus } from '@/lib/billing';
import { ensureTenantForUser } from '@/lib/tenant';

export const metadata: Metadata = {
  title: 'LavaMesh · Private Mesh Networking',
  description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. Zero per-seat fees. Flat-rate pricing.',
  metadataBase: new URL('https://www.lavamesh.com'),
  applicationName: 'LavaMesh',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  openGraph: {
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. Zero per-seat fees.',
    url: 'https://www.lavamesh.com',
    siteName: 'LavaMesh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LavaMesh · Private Mesh Networking',
    description: 'Self-hosted mesh networking dashboard powered by Headscale. Own your network. Zero per-seat fees.',
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
  const plan = userId ? await getPlanStatus(userId).catch(() => null) : null;

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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <MainLayout planTier={plan?.tier ?? 'community'} isPro={plan?.isPro ?? false}>{children}</MainLayout>
        </div>
      </body>
    </html>
  );
}
