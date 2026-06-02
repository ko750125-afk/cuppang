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

export default function Settlement() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const { settings, getAllRecords } = useAppStore();

  useEffect(() => {
    const today = new Date();
    // 항상 현재 진행 중인 정산(이번 달)을 기본으로 표시
    setTargetDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  if (!targetDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const records = getAllRecords();
  const settlement = calculateMonthlySettlement(targetDate, records, settings);


  const changeMonth = (offset: number) => {
    // day를 1로 고정해 settlementStartDay보다 항상 작게 유지 → 네비게이션 月 = 정산 종료 月 일치
    const d = new Date(targetDate!.getFullYear(), targetDate!.getMonth() + offset, 1);
    setTargetDate(d);
  };

  // 달력 셀 계산 로직
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const toDateStringForCal = toDateString;

  const calendarCells: { date: Date; isCurrentMonth: boolean; isWithinPeriod: boolean }[] = [];

  // 이전 달 끝부분 — 정산 기간에 포함될 수 있으므로 isWithinPeriod 정확히 계산
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthTotalDays - i);
    const dateStr = toDateStringForCal(d);
    const isWithin = dateStr >= settlement.startDate && dateStr <= settlement.endDate;
    calendarCells.push({
      date: d,
      isCurrentMonth: false,
      isWithinPeriod: isWithin
    });
  }

  // 이번 달
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    const dateStr = toDateStringForCal(d);
    const isWithin = dateStr >= settlement.startDate && dateStr <= settlement.endDate;
    calendarCells.push({
      date: d,
      isCurrentMonth: true,
      isWithinPeriod: isWithin
    });
  }

  // 다음 달 시작 — 정산 기간에 포함될 수 있으므로 isWithinPeriod 정확히 계산
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = toDateStringForCal(d);
    const isWithin = dateStr >= settlement.startDate && dateStr <= settlement.endDate;
    calendarCells.push({
      date: d,
      isCurrentMonth: false,
      isWithinPeriod: isWithin
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      <AppHeader />

      <div className="p-5 space-y-5">
        {/* 정산 연월 타이틀 및 컨트롤러 */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#191F28] tracking-tight leading-tight">
              {/* 정산 기간을 제목에 명확히 표시 */}
              {parseInt(settlement.endDate.split('-')[1], 10)}월 정산
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
            {/* endDate 기준 월을 정산액 라벨로 표시 (예: 5월 25일 마감 → 5월 정산액) */}
            <span>{parseInt(settlement.endDate.split('-')[1], 10)}월 정산액</span>
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

        {/* 일별 상세 내역 (달력 형태) */}
        <div className="space-y-3">
          <h3 className="font-bold text-[16px] text-[#191F28] px-1">일별 상세 내역</h3>
          <Card className="rounded-xl overflow-hidden shadow-xs border border-[#E5E8EB] bg-white p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#4E5968] pb-2 border-b border-[#E5E8EB]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div 
                  key={day} 
                  className={cn(
                    idx === 0 ? "text-[#F04452]" : idx === 6 ? "text-[#1850d4]" : ""
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-[1px] bg-[#E5E8EB] border border-[#E5E8EB] rounded-lg overflow-hidden mt-3">
              {calendarCells.map((cell, index) => {
                const dateStr = toDateStringForCal(cell.date);
                const rec = records.find(r => r.date === dateStr);
                const dailyTotal = rec ? Object.values(rec.deliveries).reduce((a, b) => a + b, 0) : 0;
                const isSunday = cell.date.getDay() === 0;
                const isSaturday = cell.date.getDay() === 6;
                const isSelected = format(cell.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square flex flex-col justify-between p-1 bg-white transition-all",
                      // 정산기간 내 날짜는 이전/다음달 여부 무관하게 활성 표시
                      cell.isWithinPeriod && !isSelected && "bg-white hover:bg-[#f8f9fa]",
                      cell.isWithinPeriod && isSelected && "bg-blue-50/40 hover:bg-blue-50/50",
                      // 정산기간 외 날짜는 흐리게
                      !cell.isWithinPeriod && "bg-[#f8f9fa] opacity-30 pointer-events-none",
                      // 오늘 날짜 테두리
                      isSelected && "ring-2 ring-[#1850d4] ring-inset z-2"
                    )}
                  >
                    {/* 날짜 표시 */}
                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-none",
                        isSunday && "text-[#F04452]",
                        isSaturday && "text-[#1850d4]",
                        cell.isWithinPeriod ? "text-[#191F28]" : "text-[#4E5968]",
                        !cell.isCurrentMonth && cell.isWithinPeriod && "opacity-60",
                        isSelected && "font-extrabold text-[#1850d4]"
                      )}
                    >
                      {cell.date.getDate()}
                    </span>

                    {/* 배송 건수 표시 */}
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
