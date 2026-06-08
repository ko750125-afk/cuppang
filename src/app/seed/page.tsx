'use client';

import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toDateString } from '@/lib/utils';
import { DailyRecord } from '@/types';

const START = '2025-03-06';
const END   = '2025-05-17';
const COUNT = 380;

function getDatesInRange(startStr: string, endStr: string): string[] {
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const dates: string[] = [];
  while (cur <= end) {
    dates.push(toDateString(new Date(cur)));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function SeedPage() {
  const { user, settings, syncFromFirestore } = useAppStore();
  const [log, setLog]   = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  if (!user) {
    return <div className="p-8 text-center text-sm">로그인 후 이용하세요.</div>;
  }

  const handleSeed = async () => {
    setRunning(true);
    setLog([]);

    const zoneId = settings.zones[0]?.id ?? '1';
    const zoneName = settings.zones[0]?.name ?? '기본구역';
    setLog(prev => [...prev, `사용 구역: ${zoneName} (ID: ${zoneId})`]);

    // 1. Firestore에서 현재 records 읽기
    const snap = await getDoc(doc(db, 'cuppang_records', user.uid));
    const firestoreRecords: Record<string, DailyRecord> = snap.exists()
      ? (snap.data().records as Record<string, DailyRecord>)
      : {};

    // 2. 채울 날짜 결정
    const allDates = getDatesInRange(START, END);
    const toFill: string[] = [];
    const skippedRest: string[] = [];
    const skippedExist: string[] = [];

    for (const dateStr of allDates) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay(); // 0=일, 1=월, 2=화

      if (dow === 1 || dow === 2) {
        skippedRest.push(dateStr);
        continue;
      }

      const existing = firestoreRecords[dateStr];
      const total = existing
        ? Object.values(existing.deliveries).reduce((a, b) => a + b, 0)
        : 0;

      if (total > 0) {
        skippedExist.push(dateStr);
      } else {
        toFill.push(dateStr);
      }
    }

    setLog(prev => [
      ...prev,
      `전체 날짜: ${allDates.length}일`,
      `휴무(월/화) 제외: ${skippedRest.length}일`,
      `기존 데이터 있음 제외: ${skippedExist.length}일`,
      `채울 날짜: ${toFill.length}일`,
      '─────────────────',
    ]);

    if (toFill.length === 0) {
      setLog(prev => [...prev, '채울 날짜가 없습니다. 이미 모두 입력되어 있습니다.']);
      setDone(true);
      setRunning(false);
      return;
    }

    // 3. 새 records 병합
    for (const dateStr of toFill) {
      firestoreRecords[dateStr] = {
        date: dateStr,
        deliveries: { [zoneId]: COUNT },
        freshBagCount: 0,
      };
    }

    // 4. Firestore에 한 번에 쓰기
    setLog(prev => [...prev, 'Firestore에 저장 중...']);
    await setDoc(doc(db, 'cuppang_records', user.uid), { records: firestoreRecords });

    // 5. 로컬 스토어 갱신
    await syncFromFirestore(user.uid);

    setLog(prev => [
      ...prev,
      `완료! ${toFill.length}개 날짜에 배송 ${COUNT}개 저장됨`,
      '',
      '이 페이지는 삭제해도 됩니다.',
    ]);
    setDone(true);
    setRunning(false);
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-lg font-bold mb-1">데이터 시드</h1>
      <p className="text-xs text-gray-500 mb-4">
        {START} ~ {END} 중 비어있는 날짜(월·화 제외)에 배송 {COUNT}개를 채웁니다.
      </p>

      {!done && (
        <button
          onClick={handleSeed}
          disabled={running}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          {running ? '처리 중...' : '데이터 채우기'}
        </button>
      )}

      {log.length > 0 && (
        <pre className="mt-4 text-xs bg-gray-100 rounded p-3 whitespace-pre-wrap">
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}
