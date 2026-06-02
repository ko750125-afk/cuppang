'use client';

import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Route as RouteIcon } from 'lucide-react';
import { Zone, DailyRecord } from '@/types';

interface DeliveryInputCardProps {
  zone: Zone;
  record: DailyRecord;
  onCountChange: (zoneId: string, value: string) => void;
}

export function DeliveryInputCard({ zone, record, onCountChange }: DeliveryInputCardProps) {
  return (
    <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <RouteIcon className="w-5 h-5 text-[#1850d4]" />
          <span className="font-extrabold text-[16px] text-[#191F28]">{zone.name}</span>
        </div>
        <span className="text-sm text-[#4E5968] font-bold">{zone.price.toLocaleString()}원</span>
      </div>

      <div className="relative">
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={record.deliveries[zone.id] === undefined ? '' : record.deliveries[zone.id]}
          onChange={(e) => onCountChange(zone.id, e.target.value)}
          placeholder="0"
          className="w-full text-left text-2xl font-black pl-5 pr-12 h-16 rounded-xl bg-[#f3f4f5] border-transparent focus:border-[#1850d4] focus:bg-white transition-colors"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-bold text-[#4E5968] pointer-events-none">건</span>
      </div>
    </Card>
  );
}
