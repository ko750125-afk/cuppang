'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { calculateMonthlySettlement, calculatePaymentDate } from '@/lib/calculations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, toDateString } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';

type CalendarCell = { date: Date; isCurrentMonth: boolean; isWithinPeriod: boolean };

function buildCalendarCells(year: number, month: number, startDate: string, endDate: string): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const firstDayOfWeek   = new Date(year, month, 1).getDay();
  const totalDays        = new Date(year, month + 1, 0).getDate();
  const prevMonthDays    = new Date(year, month, 0).getDate();

  const cell = (date: Date, isCurrentMonth: boolean): CalendarCell => {
    const ds = toDateString(date);
    return { date, isCurrentMonth, isWithinPeriod: ds >= startDate && ds <= endDate };
  };

  for (let i = firstDayOfWeek - 1; i >= 0; i--)
    cells.push(cell(new Date(year, month - 1, prevMonthDays - i), false));

  for (let i = 1; i <= totalDays; i++)
    cells.push(cell(new Date(year, month, i), true));

  for (let i = 1; i <= 42 - cells.length; i++)
    cells.push(cell(new Date(year, month + 1, i), false));

  return cells;
}

export default function Settlement() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const { settings, getAllRecords } = useAppStore();

  useEffect(() => {
    const today = new Date();
    setTargetDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  if (!targetDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const records    = getAllRecords();
  const settlement = calculateMonthlySettlement(targetDate, records, settings);
  const endMonth   = parseInt(settlement.endDate.split('-')[1], 10);

  const changeMonth = (offset: number) => {
    setTargetDate(new Date(targetDate.getFullYear(), targetDate.getMonth() + offset, 1));
  };

  const calendarCells = buildCalendarCells(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    settlement.startDate,
    settlement.endDate
  );

  const todayStr = toDateString(new Date());
  const WEEKDAY_COLORS = ['text-[#F04452]', '', '', '', '', '', 'text-[#1850d4]'];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      <AppHeader />

      <div className="p-5 space-y-5">
        {/* 정산 연월 타이틀 및 컨트롤러 */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#191F28] tracking-tight leading-tight">
              {endMonth}월 정산
            </h2>
            <span className="text-[11px] font-semibold text-[#4E5968] mt-0.5 block">
              {settlement.startDate.replace(/-/g, '.')} ~ {settlement.endDate.replace(/-/g, '.')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E8EB] rounded-lg px-1.5 py-0.5 shadow-xs">
            <Button variant="ghost" onClick={() => changeMonth(-1)} className="h-6 w-6 p-0 rounded-md text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">&lt;</Button>
            <span className="text-[11px] font-bold text-[#191F28]">{format(targetDate, 'yyyy.MM')}</span>
            <Button variant="ghost" onClick={() => changeMonth(1)} className="h-6 w-6 p-0 rounded-md text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">&gt;</Button>
          </div>
        </div>

        {/* 요약 카드 */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
          <div className="text-[11px] font-bold text-[#4E5968] tracking-wider uppercase mb-1 flex items-center justify-between">
            <span>{endMonth}월 정산액</span>
            <span className="bg-[#E6F9F2] text-[#00D082] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-normal uppercase">Settled</span>
          </div>
          <div className="text-[13px] font-extrabold text-[#1850d4] mb-1">
            수령일 {format(calculatePaymentDate(settlement.endDate, settings.payDay), 'M/d(EEE)', { locale: ko })}
          </div>
          <div className="text-[32px] font-extrabold text-[#191F28] tracking-tight mb-4">
            ₩{Math.floor(settlement.totalNetRevenue).toLocaleString()}
          </div>
          <div className="pt-4 border-t border-[#E5E8EB] space-y-2 text-xs font-semibold text-[#4E5968]">
            <div className="flex justify-between">
              <span>기본 매출 (배송 {settlement.totalDeliveries}건)</span>
              <span className="text-[#191F28] font-bold">₩{settlement.totalBaseRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>수수료 공제 ({settings.commissionRate}%)</span>
              <span className="text-[#F04452] font-bold">- ₩{Math.floor(settlement.totalCommissionDeduction).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* 월별 배송 내역 (달력 형태) */}
        <div className="space-y-3">
          <h3 className="font-bold text-[16px] text-[#191F28] px-1">
            월별 배송 내역
            <span className="text-[13px] font-semibold text-[#4E5968] ml-2">{format(targetDate, 'yyyy년 M월', { locale: ko })}</span>
          </h3>
          <Card className="rounded-xl overflow-hidden shadow-xs border border-[#E5E8EB] bg-white p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#4E5968] pb-2 border-b border-[#E5E8EB]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className={WEEKDAY_COLORS[idx]}>{day}</div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-[1px] bg-[#E5E8EB] border border-[#E5E8EB] rounded-lg overflow-hidden mt-3">
              {calendarCells.map((cell, index) => {
                const dateStr    = toDateString(cell.date);
                const rec        = records.find(r => r.date === dateStr);
                const dailyTotal = rec ? Object.values(rec.deliveries).reduce((a, b) => a + b, 0) : 0;
                const dow        = cell.date.getDay();
                const isToday    = dateStr === todayStr;

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square flex flex-col justify-between p-1 bg-white transition-all",
                      cell.isWithinPeriod && !isToday  && "bg-white hover:bg-[#f8f9fa]",
                      cell.isWithinPeriod && isToday   && "bg-blue-50/40 hover:bg-blue-50/50",
                      !cell.isWithinPeriod             && "bg-[#f8f9fa] opacity-30 pointer-events-none",
                      isToday                          && "ring-2 ring-[#1850d4] ring-inset z-2"
                    )}
                  >
                    <span className={cn(
                      "text-[9px] font-semibold leading-none",
                      dow === 0 && "text-[#F04452]",
                      dow === 6 && "text-[#1850d4]",
                      cell.isWithinPeriod ? "text-[#191F28]" : "text-[#4E5968]",
                      !cell.isCurrentMonth && cell.isWithinPeriod && "opacity-60",
                      isToday && "font-extrabold text-[#1850d4]"
                    )}>
                      {cell.date.getDate()}
                    </span>

                    {cell.isWithinPeriod && dailyTotal > 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="bg-[#1850d4] text-white font-extrabold text-[10px] h-5 px-1 rounded-full flex items-center justify-center min-w-5 shadow-xs">
                          {dailyTotal}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
