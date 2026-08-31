import { AppSettings, DailyRecord } from "@/types";
import { toDateString } from "@/lib/utils";

/**
 * 하루 배송 매출을 계산합니다.
 *
 * - 구역(Zone)별 단가가 다른 경우를 정확히 처리합니다.
 * - 구역 ID가 재생성된 경우(ID 불일치) 단일 구역 한정 전체 건수로 폴백합니다.
 */
export function calculateDailyRevenue(record: DailyRecord, settings: AppSettings) {
  // 구역 ID → 단가 맵
  const zoneMap = new Map(settings.zones.map(z => [z.id, z.price]));

  // 구역별 (배송 건수 × 단가) 합산
  let baseRevenue = Object.entries(record.deliveries).reduce((sum, [zoneId, count]) => {
    const price = zoneMap.get(zoneId);
    return price !== undefined ? sum + count * price : sum;
  }, 0);

  // 폴백: 구역 ID 변경(재생성) 등으로 매칭 실패 + 단일 구역인 경우
  if (baseRevenue === 0 && settings.zones.length === 1) {
    const totalCount = Object.values(record.deliveries).reduce((a, b) => a + b, 0);
    if (totalCount > 0) baseRevenue = totalCount * settings.zones[0].price;
  }

  // 일별 프레쉬백 인센티브 (근무일마다 가산되는 고정 금액)
  const dailyIncentive  = settings.freshBagIncentive ?? 0;
  const grossRevenue    = baseRevenue + dailyIncentive;
  const commissionDeduction = grossRevenue * (settings.commissionRate / 100);

  return {
    baseRevenue,
    freshBagRevenue:   dailyIncentive,       // 하위 호환성 유지
    totalGrossRevenue: grossRevenue,
    commissionDeduction,
    finalNetRevenue:   grossRevenue - commissionDeduction,
  };
}

/**
 * 정산 기준일(startDay)을 기준으로 targetDate가 속하는 정산 기간을 반환합니다.
 * 예) startDay=26, targetDate=6/9 → startDate=5/26, endDate=6/25
 */
export function getSettlementPeriod(date: Date, startDay: number) {
  let startMonth = date.getMonth();
  let startYear  = date.getFullYear();

  if (date.getDate() < startDay) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  return {
    startDate: toDateString(new Date(startYear, startMonth,     startDay)),
    endDate:   toDateString(new Date(startYear, startMonth + 1, startDay - 1)),
  };
}

/** 정산 기간 내 전체 합계를 계산합니다. */
export function calculateMonthlySettlement(
  targetDate: Date,
  records: DailyRecord[],
  settings: AppSettings
) {
  const { startDate, endDate } = getSettlementPeriod(targetDate, settings.settlementStartDay);
  const periodRecords = records.filter(r => r.date >= startDate && r.date <= endDate);

  const totals = periodRecords.reduce(
    (acc, record) => {
      const daily         = calculateDailyRevenue(record, settings);
      const deliveryCount = Object.values(record.deliveries).reduce((a, b) => a + b, 0);
      return {
        baseRevenue:         acc.baseRevenue         + daily.baseRevenue,
        freshBagRevenue:     acc.freshBagRevenue     + daily.freshBagRevenue,
        grossRevenue:        acc.grossRevenue        + daily.totalGrossRevenue,
        commissionDeduction: acc.commissionDeduction + daily.commissionDeduction,
        netRevenue:          acc.netRevenue          + daily.finalNetRevenue,
        deliveries:          acc.deliveries          + deliveryCount,
        freshBags:           acc.freshBags           + (record.freshBagCount || 0),
      };
    },
    { baseRevenue: 0, freshBagRevenue: 0, grossRevenue: 0, commissionDeduction: 0, netRevenue: 0, deliveries: 0, freshBags: 0 }
  );

  return {
    startDate,
    endDate,
    totalBaseRevenue:         totals.baseRevenue,
    totalFreshBagRevenue:     totals.freshBagRevenue,
    totalGrossRevenue:        totals.grossRevenue,
    totalCommissionDeduction: totals.commissionDeduction,
    totalNetRevenue:          totals.netRevenue,
    totalDeliveries:          totals.deliveries,
    totalFreshBags:           totals.freshBags,
    periodRecords,
  };
}

/**
 * 정산 마감일 기준 익월 payDay를 수령일로 반환합니다.
 * endDateStr의 month(1-based)를 JS Date month(0-based)로 그대로 넘기면 자동으로 익월이 됩니다.
 */
export function calculatePaymentDate(endDateStr: string, payDay: number): Date {
  const [year, month] = endDateStr.split('-').map(Number);
  return new Date(year, month, payDay);
}

/**
 * 기준일(referenceDate)로부터 최근 windowDays일(당일 포함) 구간의
 * 일 평균 배송 건수를 계산합니다.
 *
 * - 분모는 실제 배송 기록이 있는 근무일 수입니다(쉬는 날 포함 시 평균이 왜곡되므로 제외).
 */
export function calculateAverageDeliveries(
  records: DailyRecord[],
  windowDays: number = 25,
  referenceDate: Date = new Date()
) {
  const endDate   = toDateString(referenceDate);
  const startDate = toDateString(
    new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - (windowDays - 1))
  );

  const windowRecords = records.filter(r => r.date >= startDate && r.date <= endDate);
  const totalDeliveries = windowRecords.reduce(
    (sum, r) => sum + Object.values(r.deliveries).reduce((a, b) => a + b, 0),
    0
  );
  const workedDays = windowRecords.filter(
    r => Object.values(r.deliveries).reduce((a, b) => a + b, 0) > 0
  ).length;

  return {
    startDate,
    endDate,
    windowDays,
    totalDeliveries,
    workedDays,
    averagePerWorkedDay: workedDays > 0 ? totalDeliveries / workedDays : 0,
  };
}
