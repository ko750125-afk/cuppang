'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { calculateMonthlySettlement, calculatePaymentDate } from '@/lib/calculations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, toDateString } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';

type CalendarCell = { date: Date; isCurrentMonth: boolean; isWithinPeriod: boolean };

function buildCalendarCells(
  monthStartStr: string,
  monthEndStr: string,
  settlementStart: string,
  settlementEnd: string
): CalendarCell[] {
  const cells: CalendarCell[] = [];

  const [msy, msm, msd] = monthStartStr.split('-').map(Number);
  const [mey, mem, med] = monthEndStr.split('-').map(Number);
  const monthStart = new Date(msy, msm - 1, msd);
  const monthEnd   = new Date(mey, mem - 1, med);

  // 달력 첫날: 해당 월 1일이 속한 주의 일요일
  const firstDisplay = new Date(monthStart);
  firstDisplay.setDate(firstDisplay.getDate() - firstDisplay.getDay());

  // 달력 마지막날: 해당 월 말일이 속한 주의 토요일
  const lastDisplay = new Date(monthEnd);
  lastDisplay.setDate(lastDisplay.getDate() + (6 - lastDisplay.getDay()));

  const totalDays = Math.round(
    (lastDisplay.getTime() - firstDisplay.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(firstDisplay.getFullYear(), firstDisplay.getMonth(), firstDisplay.getDate() + i);
    const ds = toDateString(date);
    const isWithinPeriod = ds >= settlementStart && ds <= settlementEnd;
    // isCurrentMonth: 해당 targetDate의 월에 속하는지 여부
    const isCurrentMonth = date.getFullYear() === msy && date.getMonth() === msm - 1;
    cells.push({ date, isCurrentMonth, isWithinPeriod });
  }

  return cells;
}

import { LoginRequired } from '@/components/features/LoginRequired';

export default function Settlement() {
  const [targetDate, setTargetDate]       = useState<Date | null>(null);
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);
  const [editDeliveries, setEditDeliveries] = useState<Record<string, number>>({});

  const { settings, getAllRecords, getDailyRecord, updateDailyRecord, user } = useAppStore();

  useEffect(() => {
    const today = new Date();
    setTargetDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  // 날짜 선택 시 기존 레코드 로드
  useEffect(() => {
    if (selectedDate) {
      const rec = getDailyRecord(selectedDate);
      setEditDeliveries(rec.deliveries || {});
    }
  }, [selectedDate, getDailyRecord]);

  if (!user) return <LoginRequired />;
  if (!targetDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const records    = getAllRecords();
  const settlement = calculateMonthlySettlement(targetDate, records, settings);
  const endMonth   = parseInt(settlement.endDate.split('-')[1], 10);

  const changeMonth = (offset: number) => {
    setTargetDate(new Date(targetDate.getFullYear(), targetDate.getMonth() + offset, 1));
  };

  const targetYear  = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth(); // 0-based
  const monthStart  = toDateString(new Date(targetYear, targetMonth, 1));
  const monthEnd    = toDateString(new Date(targetYear, targetMonth + 1, 0));

  const calendarCells = buildCalendarCells(
    monthStart,
    monthEnd,
    settlement.startDate,
    settlement.endDate
  );

  const todayStr = toDateString(new Date());
  const WEEKDAY_COLORS = ['text-[#F04452]', '', '', '', '', '', 'text-[#1850d4]'];

  const handleSave = () => {
    if (!selectedDate) return;
    updateDailyRecord(selectedDate, { deliveries: editDeliveries });
    setSelectedDate(null);
  };

  // 다이얼로그 타이틀용 날짜 포맷 (UTC 오프셋 회피)
  const formatDialogDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return format(new Date(y, m - 1, d), 'M월 d일 (EEE)', { locale: ko });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-24">
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
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-[16px] text-[#191F28]">
              월별 배송 내역
              <span className="text-[13px] font-semibold text-[#4E5968] ml-2">{format(targetDate, 'yyyy년 M월', { locale: ko })}</span>
            </h3>
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E8EB] rounded-lg px-1.5 py-0.5 shadow-xs">
              <Button variant="ghost" onClick={() => changeMonth(-1)} className="h-6 w-6 p-0 rounded-md text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">&lt;</Button>
              <span className="text-[11px] font-bold text-[#191F28]">{format(targetDate, 'yyyy.MM')}</span>
              <Button variant="ghost" onClick={() => changeMonth(1)} className="h-6 w-6 p-0 rounded-md text-[#4E5968] hover:text-[#191F28] hover:bg-muted/50">&gt;</Button>
            </div>
          </div>
          <Card className="rounded-xl shadow-xs border border-[#E5E8EB] bg-white p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#4E5968] pb-2 border-b border-[#E5E8EB]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className={WEEKDAY_COLORS[idx]}>{day}</div>
              ))}
            </div>

            {/* 날짜 그리드 — 정산 기간 셀은 클릭 가능 */}
            <div className="grid grid-cols-7 gap-[1px] bg-[#E5E8EB] border border-[#E5E8EB] rounded-lg overflow-hidden mt-3">
              {calendarCells.map((cell, index) => {
                const dateStr    = toDateString(cell.date);
                const dow        = cell.date.getDay();

                const rec        = records.find(r => r.date === dateStr);
                const dailyTotal = rec ? Object.values(rec.deliveries).reduce((a, b) => a + b, 0) : 0;
                const isToday    = dateStr === todayStr;

                return (
                  <div
                    key={index}
                    onClick={() => cell.isWithinPeriod && setSelectedDate(dateStr)}
                    className={cn(
                      "relative aspect-square flex flex-col justify-between p-1 bg-white transition-all",
                      cell.isWithinPeriod ? "cursor-pointer active:scale-95 hover:bg-[#f8f9fa]" : "pointer-events-none",
                      // 오늘: 파란 ring 강조
                      isToday
                        ? "bg-blue-50/40 hover:bg-blue-50/50 ring-2 ring-[#1850d4] ring-inset z-2"
                        // 전월/익월: 테두리선으로만 구분, 배경은 동일한 흰색
                        : !cell.isCurrentMonth && "ring-1 ring-inset ring-[#B0B8C1]",
                    )}
                  >
                    <span className={cn(
                      "text-[9px] font-semibold leading-none",
                      isToday
                        ? "font-extrabold text-[#1850d4]"
                        : cell.isWithinPeriod
                          ? (dow === 0 ? "text-[#F04452]" : dow === 6 ? "text-[#1850d4]" : "text-[#191F28]")
                          : (!cell.isCurrentMonth
                              ? "text-[#8B95A1]"
                              : (dow === 0 ? "text-[#F04452]/40" : dow === 6 ? "text-[#1850d4]/40" : "text-[#B0B8C1]")),
                    )}>
                      {cell.date.getDate()}
                    </span>

                    {dailyTotal > 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className={cn(
                          "font-extrabold text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center min-w-5 shadow-xs transition-all",
                          cell.isWithinPeriod 
                            ? "bg-[#1850d4] text-white" 
                            : "bg-[#E5E8EB] text-[#8B95A1] opacity-80" // 정산 외 기간은 차분한 회색 배지로 차별화
                        )}>
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

      {/* 날짜 클릭 시 배송 건수 입력 다이얼로그 */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => { if (!open) setSelectedDate(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-5 border-[#E5E8EB]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-extrabold text-[#191F28]">
              {selectedDate ? formatDialogDate(selectedDate) : ''} 배송 입력
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {settings.zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-3 border border-[#E5E8EB] rounded-xl bg-white shadow-xs">
                <div>
                  <span className="font-bold text-xs text-[#191F28] block">{zone.name}</span>
                  <span className="text-[11px] text-[#4E5968] font-medium mt-0.5 block">단가 {zone.price.toLocaleString()}원</span>
                </div>
                <div className="w-24 relative">
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editDeliveries[zone.id] === undefined ? '' : editDeliveries[zone.id]}
                    onChange={(e) => {
                      const num = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      if (!isNaN(num)) setEditDeliveries(prev => ({ ...prev, [zone.id]: num }));
                    }}
                    placeholder="0"
                    className="text-right pr-8 h-9 text-xs font-bold rounded-lg border-[#E5E8EB] bg-[#f8f9fa] focus:bg-white focus:border-[#1850d4]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4E5968] pointer-events-none">건</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-lg h-10 text-xs" onClick={() => setSelectedDate(null)}>
              취소
            </Button>
            <Button
              className="flex-1 rounded-lg h-10 bg-[#041627] text-white text-xs font-semibold hover:bg-[#1a2b3c]"
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
