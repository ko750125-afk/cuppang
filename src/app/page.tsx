'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toDateString } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { DeliveryInputCard } from '@/components/features/DeliveryInputCard';
import { MissedDeliveryDialog } from '@/components/features/MissedDeliveryDialog';

export default function Home() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const { settings, updateDailyRecord, getDailyRecord } = useAppStore();

  useEffect(() => {
    // 새벽 근무자: 근무는 전날 시작 → 배송 기록은 근무 시작일(전날)로 저장
    const workStartDate = new Date();
    workStartDate.setDate(workStartDate.getDate() - 1);
    setCurrentDate(toDateString(workStartDate));
  }, []);

  if (!currentDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const dailyRecord = getDailyRecord(currentDate);

  const handleZoneChange = (zoneId: string, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(num)) return;
    updateDailyRecord(currentDate, {
      deliveries: { ...dailyRecord.deliveries, [zoneId]: num }
    });
  };

  const changeDate = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(toDateString(d));
  };

  const handleMissedSave = (date: string, deliveries: Record<string, number>) => {
    updateDailyRecord(date, { deliveries });
    setCurrentDate(date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      <AppHeader />

      <div className="p-5 space-y-4">
        {/* 사업장 카드 */}
        <Card className="bg-[#1850d4] border-0 shadow-sm rounded-xl p-5 flex items-center justify-center">
          <span className="text-[22px] font-extrabold text-white tracking-tight">송파물류</span>
        </Card>

        {/* 날짜 선택 카드 */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => changeDate(-1)} className="rounded-full h-9 w-9 p-0 text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">
              &lt;
            </Button>
            <span className="text-[20px] font-extrabold text-[#191F28] tracking-tight">
              {format(new Date(currentDate), 'MMM dd, yyyy', { locale: enUS })}
            </span>
            <Button variant="ghost" onClick={() => changeDate(1)} className="rounded-full h-9 w-9 p-0 text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">
              &gt;
            </Button>
          </div>
        </Card>

        {/* 누락 배송 입력 다이얼로그 */}
        <MissedDeliveryDialog
          zones={settings.zones}
          getRecord={getDailyRecord}
          onSave={handleMissedSave}
        />

        {/* 배송 입력 카드 */}
        <div className="space-y-3 pt-2">
          {settings.zones.length > 0 && (
            <DeliveryInputCard
              zone={settings.zones[0]}
              record={dailyRecord}
              onCountChange={handleZoneChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
