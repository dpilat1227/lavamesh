'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Nodes', path: '/' },
    { name: 'Routes', path: '/routes' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[280px] border-r border-white/[0.05] bg-[#050505]/80 backdrop-blur-3xl flex flex-col min-h-screen pt-4">
      <div className="h-14 flex items-center px-8 mb-6">
        <div className="w-8 h-8 rounded-[10px] border border-[#ff5a00]/30 bg-gradient-to-br from-[#1a0802] to-[#3a1405] flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(255,90,0,0.15)]">
          <svg className="w-4 h-4 text-[#ff5a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
          </svg>
        </div>
        <span className="text-white font-semibold text-[16px] tracking-tight">LavaMesh</span>
      </div>
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center px-4 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-[#ff5a00]/10 text-white border border-[#ff5a00]/30 shadow-[0_0_10px_rgba(255,90,0,0.05)]' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
