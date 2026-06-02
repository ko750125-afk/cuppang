'use client';

import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface AppHeaderProps {
  rightSlot?: ReactNode;
}

export function AppHeader({ rightSlot }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8EB] bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#041627]" />
        <span className="font-bold text-[17px] tracking-tight text-[#191F28]">Settlement Pro</span>
      </div>
      {rightSlot ?? (
        <div className="w-9 h-9" /> // 오른쪽 자리 유지용 빈 공간
      )}
    </div>
  );
}
