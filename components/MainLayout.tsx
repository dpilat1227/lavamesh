'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/';

  if (isPublic) {
    // No constraints — let the page scroll naturally
    return <>{children}</>;
  }

  // Dashboard / admin routes: contained full-height layout
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Orange accent line at top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,90,0,0.3) 50%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
        {children}
      </div>
    </div>
  );
}
