import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'LavaMesh · Network Dashboard',
  description: 'Self-hosted mesh network management powered by Headscale',
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
          height: '100vh',
          overflow: 'hidden',
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
        <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <MainLayout>{children}</MainLayout>
        </div>
      </body>
    </html>
  );
}
