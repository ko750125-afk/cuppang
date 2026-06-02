import { AppSettings, DailyRecord } from "@/types";

/**
 * 하루 단위 매출을 계산합니다.
 */
export function calculateDailyRevenue(record: DailyRecord, settings: AppSettings) {
  let baseRevenue = 0;

  // 구역별 배송 수량에 따른 기본 매출 계산
  const zoneMap = new Map(settings.zones.map(z => [z.id, z.price]));
  for (const [zoneId, count] of Object.entries(record.deliveries)) {
    const price = zoneMap.get(zoneId);
    if (price !== undefined) {
      baseRevenue += count * price;
    }
  }

  // Fallback: zone ID가 바뀐 경우(구역 재생성 등) 구역이 하나뿐이면 해당 단가로 전체 배송 건수 계산
  if (baseRevenue === 0 && settings.zones.length === 1) {
    const totalCount = Object.values(record.deliveries).reduce((a, b) => a + b, 0);
    if (totalCount > 0) {
      baseRevenue = totalCount * settings.zones[0].price;
    }
  }
  
  const freshBagIncentive = baseRevenue * ((settings.freshBagIncentiveRate || 0) / 100);
  const totalGrossRevenue = baseRevenue + freshBagIncentive;
  const commissionDeduction = totalGrossRevenue * (settings.commissionRate / 100);
  const finalNetRevenue = totalGrossRevenue - commissionDeduction;

  return {
    baseRevenue,
    freshBagRevenue: freshBagIncentive,
    totalGrossRevenue,
    commissionDeduction,
    finalNetRevenue
  };
}

/**
 * 정산 기간을 계산합니다.
 * @param date 기준 날짜
 * @param startDay 정산 시작일 (예: 25일)
 */
export function getSettlementPeriod(date: Date, startDay: number) {
  const currentDay = date.getDate();
  let startMonth = date.getMonth();
  let startYear = date.getFullYear();

  if (currentDay < startDay) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  const startDate = new Date(startYear, startMonth, startDay);
  const endDate = new Date(startYear, startMonth + 1, startDay - 1);

  // 로컬 시간대 보정하여 YYYY-MM-DD 문자열로 변환
  const toDateString = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  return {
    startDate: toDateString(startDate),
    endDate: toDateString(endDate)
  };
}

/**
 * 특정 월의 정산 기간 범위에 해당하는 기록들을 필터링하여 합산합니다.
 */
export function calculateMonthlySettlement(
  targetDate: Date, 
  records: DailyRecord[], 
  settings: AppSettings
) {
  const { startDate, endDate } = getSettlementPeriod(targetDate, settings.settlementStartDay);
  
  const periodRecords = records.filter(r => r.date >= startDate && r.date <= endDate);

  let totalBaseRevenue = 0;
  let totalFreshBagRevenue = 0;
  let totalGrossRevenue = 0;
  let totalCommissionDeduction = 0;
  let totalNetRevenue = 0;
  let totalDeliveries = 0;
  let totalFreshBags = 0;

  periodRecords.forEach(record => {
    const daily = calculateDailyRevenue(record, settings);
    totalBaseRevenue += daily.baseRevenue;
    totalFreshBagRevenue += daily.freshBagRevenue;
    totalGrossRevenue += daily.totalGrossRevenue;
    totalCommissionDeduction += daily.commissionDeduction;
    totalNetRevenue += daily.finalNetRevenue;
    
    Object.values(record.deliveries).forEach(count => {
      totalDeliveries += count;
    });
    totalFreshBags += (record.freshBagCount || 0);
  });

  return {
    startDate,
    endDate,
    totalBaseRevenue,
    totalFreshBagRevenue,
    totalGrossRevenue,
    totalCommissionDeduction,
    totalNetRevenue,
    totalDeliveries,
    totalFreshBags,
    periodRecords
  };
}

/**
 * 정산 마감일(endDate)을 기준으로 다음 달 payDay 수령일을 계산합니다.
 * @param endDateStr YYYY-MM-DD 형식의 정산 마감일 문자열
 * @param payDay 지급일 설정값 (예: 15일)
 */
export function calculatePaymentDate(endDateStr: string, payDay: number): Date {
  const [year, month] = endDateStr.split('-').map(Number);
  // endDateStr의 월(1-based)을 JS Date의 월(0-based) 인자로 그대로 주면 자동으로 익월이 됨
  // 예: "2026-06-24" -> year: 2026, month: 6 (7월) -> new Date(2026, 6, 15) => 2026년 7월 15일
  return new Date(year, month, payDay);
}
