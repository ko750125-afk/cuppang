'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: '홈', path: '/', icon: Home },
    { name: '정산', path: '/settlement', icon: CalendarDays },
    { name: '설정', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border-t border-border h-16 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-xs font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
