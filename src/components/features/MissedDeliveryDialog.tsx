'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toDateString } from '@/lib/utils';
import { Zone, DailyRecord } from '@/types';

interface MissedDeliveryDialogProps {
  zones: Zone[];
  getRecord: (date: string) => DailyRecord;
  onSave: (date: string, deliveries: Record<string, number>) => void;
}

export function MissedDeliveryDialog({ zones, getRecord, onSave }: MissedDeliveryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deliveries, setDeliveries] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedDate) {
      const rec = getRecord(toDateString(selectedDate));
      setDeliveries(rec.deliveries || {});
    }
  }, [selectedDate, getRecord]);

  const handleSave = () => {
    if (!selectedDate) return;
    onSave(toDateString(selectedDate), deliveries);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ko}
              className="w-full flex justify-center"
            />
          </div>

          {selectedDate && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#f3f4f5] px-3.5 py-3 rounded-xl border border-[#E5E8EB]">
                <span className="font-semibold text-xs text-[#4E5968]">선택된 날짜</span>
                <span className="text-[#041627] font-bold text-xs">{format(selectedDate, 'yyyy년 MM월 dd일')}</span>
              </div>

              <div className="space-y-2.5">
                {zones.map((zone) => (
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
                        value={deliveries[zone.id] === undefined ? '' : deliveries[zone.id]}
                        onChange={(e) => {
                          const num = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          if (!isNaN(num)) {
                            setDeliveries(prev => ({ ...prev, [zone.id]: num }));
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
                <Button variant="outline" className="flex-1 rounded-lg h-10 text-xs" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button
                  className="flex-1 rounded-lg h-10 bg-[#041627] text-white text-xs font-semibold hover:bg-[#1a2b3c]"
                  onClick={handleSave}
                >
                  입력 완료
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
