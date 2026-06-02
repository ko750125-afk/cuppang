'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { calculateMonthlySettlement, calculatePaymentDate } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Wallet, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settlement() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const { settings, getAllRecords } = useAppStore();

  useEffect(() => {
    setTargetDate(new Date());
  }, []);

  if (!targetDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const records = getAllRecords();
  const settlement = calculateMonthlySettlement(targetDate, records, settings);

  const changeMonth = (offset: number) => {
    const d = new Date(targetDate);
    d.setMonth(d.getMonth() + offset);
    setTargetDate(d);
  };

  // 달력 셀 계산 로직
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const toDateStringForCal = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const calendarCells: { date: Date; isCurrentMonth: boolean; isWithinPeriod: boolean }[] = [];

  // 이전 달 끝부분
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthTotalDays - i);
    calendarCells.push({
      date: d,
      isCurrentMonth: false,
      isWithinPeriod: false
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

  // 다음 달 시작
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    calendarCells.push({
      date: d,
      isCurrentMonth: false,
      isWithinPeriod: false
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      {/* 핀테크 헤더 바 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8EB] bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#041627]" />
          <span className="font-bold text-[17px] tracking-tight text-[#191F28]">Settlement Pro</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 p-0 hover:bg-muted/50">
          <MoreVertical className="w-5 h-5 text-[#4E5968]" />
        </Button>
      </div>

      <div className="p-5 space-y-5">
        {/* 정산 연월 타이틀 및 컨트롤러 */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#191F28] tracking-tight leading-tight">
              {format(targetDate, 'yyyy년 MM월 정산', { locale: ko })}
            </h2>
            <span className="text-[11px] font-bold text-[#1850d4] mt-0.5 block">
              (수령일: {format(calculatePaymentDate(settlement.endDate, settings.payDay), 'MM/dd')})
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
            <span>최종 실수령액 예상</span>
            <span className="bg-[#E6F9F2] text-[#00D082] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-normal uppercase">Settled</span>
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
                      !cell.isCurrentMonth && "opacity-25 pointer-events-none bg-[#f8f9fa]",
                      cell.isCurrentMonth && !cell.isWithinPeriod && "bg-[#f8f9fa] opacity-40",
                      cell.isCurrentMonth && cell.isWithinPeriod && (isSelected ? "bg-blue-50/30" : "hover:bg-[#f8f9fa] bg-white")
                    )}
                  >
                    {/* 날짜 표시 */}
                    <span 
                      className={cn(
                        "text-[9px] font-semibold leading-none",
                        isSunday && "text-[#F04452]",
                        isSaturday && "text-[#1850d4]",
                        cell.isCurrentMonth && cell.isWithinPeriod ? "text-[#191F28]" : "text-[#4E5968]"
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
