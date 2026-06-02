'use client';

import { Wallet } from 'lucide-react';
import { ReactNode } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AppHeaderProps {
  rightSlot?: ReactNode;
}

export function AppHeader({ rightSlot }: AppHeaderProps) {
  const today = new Date();
  const dateLabel = format(today, 'M/d(EEE)', { locale: ko });

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8EB] bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#041627]" />
        <span className="font-bold text-[17px] tracking-tight text-[#191F28]">Settlement Pro</span>
      </div>
      {rightSlot ?? (
        <span className="text-[12px] font-bold text-[#4E5968]">{dateLabel}</span>
      )}
    </div>
  );
}
