'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return <main className="min-h-screen bg-black w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen relative z-10 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
