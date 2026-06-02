'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Wallet, Bell, Route as RouteIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function Home() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [missedDate, setMissedDate] = useState<Date | undefined>(new Date());
  const [missedDeliveries, setMissedDeliveries] = useState<Record<string, number>>({});
  
  const { settings, updateDailyRecord, getDailyRecord } = useAppStore();

  const toDateString = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  useEffect(() => {
    setCurrentDate(toDateString(new Date()));
  }, []);

  useEffect(() => {
    if (missedDate) {
      const dateStr = toDateString(missedDate);
      const rec = getDailyRecord(dateStr);
      setMissedDeliveries(rec.deliveries || {});
    }
  }, [missedDate, getDailyRecord]);

  if (!currentDate) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const dailyRecord = getDailyRecord(currentDate);
  
  const totalDeliveries = Object.values(dailyRecord.deliveries).reduce((a, b) => a + b, 0);

  const handleZoneChange = (zoneId: string, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(num)) return;

    updateDailyRecord(currentDate, {
      deliveries: {
        ...dailyRecord.deliveries,
        [zoneId]: num
      }
    });
  };

  const changeDate = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    const toDateStringObj = (date: Date) => {
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
    };
    setCurrentDate(toDateStringObj(d));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      {/* 핀테크 헤더 바 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8EB] bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#041627]" />
          <span className="font-bold text-[17px] tracking-tight text-[#191F28]">Settlement Pro</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 p-0 hover:bg-muted/50">
          <Bell className="w-5 h-5 text-[#4E5968]" />
        </Button>
      </div>

      <div className="p-5 space-y-4">
        {/* 날짜 선택 카드 (TODAY) */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
          <div className="text-[11px] font-bold text-[#4E5968] text-center tracking-wider uppercase mb-1.5">
            TODAY
          </div>
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

        {/* 누락된 배송갯수 입력기능 (달력생성) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={
              <Button 
                variant="outline" 
                className="w-full rounded-xl h-11 font-bold border-dashed border-[#1850d4]/30 hover:border-[#1850d4]/60 hover:bg-[#1850d4]/5 text-[#1850d4] transition-all flex items-center justify-center gap-2 text-xs"
              />
            }
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            누락 배송 입력 (달력 선택)
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-5 border-[#E5E8EB]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#1850d4]" />
                누락 배송 입력
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex justify-center border border-[#E5E8EB] rounded-xl p-2 bg-[#f8f9fa]">
                <Calendar
                  mode="single"
                  selected={missedDate}
                  onSelect={setMissedDate}
                  locale={ko}
                  className="w-full flex justify-center"
                />
              </div>

              {missedDate && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#f3f4f5] px-3.5 py-3 rounded-xl border border-[#E5E8EB]">
                    <span className="font-semibold text-xs text-[#4E5968]">선택된 날짜</span>
                    <span className="text-[#041627] font-bold text-xs">{format(missedDate, 'yyyy년 MM월 dd일')}</span>
                  </div>
                  
                  <div className="space-y-2.5">
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
                            value={missedDeliveries[zone.id] === undefined ? '' : missedDeliveries[zone.id]}
                            onChange={(e) => {
                              const val = e.target.value;
                              const num = val === '' ? 0 : parseInt(val, 10);
                              if (!isNaN(num)) {
                                setMissedDeliveries(prev => ({
                                  ...prev,
                                  [zone.id]: num
                                }));
                              }
                            }}
                            placeholder="0"
                            className="text-right pr-8 h-9 text-xs font-bold rounded-lg border-[#E5E8EB] bg-[#f8f9fa] focus:bg-white focus:border-[#1850d4]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4E5968] pointer-events-none">건</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 rounded-lg h-10 text-xs" onClick={() => setIsDialogOpen(false)}>
                      취소
                    </Button>
                    <Button className="flex-1 rounded-lg h-10 bg-[#041627] text-white text-xs font-semibold hover:bg-[#1a2b3c]" onClick={() => {
                      const dateStr = toDateString(missedDate);
                      updateDailyRecord(dateStr, {
                        deliveries: missedDeliveries
                      });
                      setCurrentDate(dateStr);
                      setIsDialogOpen(false);
                    }}>
                      입력 완료
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 총 배송 요약 카드 (TOTAL) */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
          <div className="text-[11px] font-bold text-[#4E5968] text-center tracking-wider uppercase mb-1.5">
            TOTAL
          </div>
          <div className="text-center flex items-baseline justify-center gap-1">
            <span className="text-[36px] font-extrabold text-[#191F28] tracking-tight leading-none">{totalDeliveries.toLocaleString()}</span>
            <span className="text-[16px] font-medium text-[#4E5968]">건</span>
          </div>
        </Card>

      {/* 라우트 실적 입력 폼 (단일 대형 입력칸) */}
      <div className="space-y-3 pt-2">
        {settings.zones.length > 0 && (() => {
          const zone = settings.zones[0];
          return (
            <Card key={zone.id} className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
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
                  value={dailyRecord.deliveries[zone.id] === undefined ? '' : dailyRecord.deliveries[zone.id]}
                  onChange={(e) => handleZoneChange(zone.id, e.target.value)}
                  placeholder="0"
                  className="w-full text-left text-2xl font-black pl-5 pr-12 h-16 rounded-xl bg-[#f3f4f5] border-transparent focus:border-[#1850d4] focus:bg-white transition-colors"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-bold text-[#4E5968] pointer-events-none">건</span>
              </div>
            </Card>
          );
        })()}
      </div>
      </div>
    </div>
  );
}
