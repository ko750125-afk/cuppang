import { AppSettings, DailyRecord } from "@/types";
import { toDateString } from "@/lib/utils";

export function calculateDailyRevenue(record: DailyRecord, settings: AppSettings) {
  let baseRevenue = 0;

  const zoneMap = new Map(settings.zones.map(z => [z.id, z.price]));
  for (const [zoneId, count] of Object.entries(record.deliveries)) {
    const price = zoneMap.get(zoneId);
    if (price !== undefined) baseRevenue += count * price;
  }

  // zone ID가 바뀐 경우(구역 재생성 등) 구역이 하나뿐이면 해당 단가로 전체 건수 계산
  if (baseRevenue === 0 && settings.zones.length === 1) {
    const totalCount = Object.values(record.deliveries).reduce((a, b) => a + b, 0);
    if (totalCount > 0) baseRevenue = totalCount * settings.zones[0].price;
  }

  const freshBagIncentive = settings.freshBagIncentive || 0;
  const totalGrossRevenue = baseRevenue + freshBagIncentive;
  const commissionDeduction = totalGrossRevenue * (settings.commissionRate / 100);

  return {
    baseRevenue,
    freshBagRevenue: freshBagIncentive,
    totalGrossRevenue,
    commissionDeduction,
    finalNetRevenue: totalGrossRevenue - commissionDeduction,
  };
}

export function getSettlementPeriod(date: Date, startDay: number) {
  let startMonth = date.getMonth();
  let startYear = date.getFullYear();

  if (date.getDate() < startDay) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  return {
    startDate: toDateString(new Date(startYear, startMonth, startDay)),
    endDate: toDateString(new Date(startYear, startMonth + 1, startDay - 1)),
  };
}

export function calculateMonthlySettlement(
  targetDate: Date,
  records: DailyRecord[],
  settings: AppSettings
) {
  const { startDate, endDate } = getSettlementPeriod(targetDate, settings.settlementStartDay);
  const periodRecords = records.filter(r => r.date >= startDate && r.date <= endDate);

  const totals = periodRecords.reduce(
    (acc, record) => {
      const daily = calculateDailyRevenue(record, settings);
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
 * 정산 마감일 기준 다음 달 payDay 수령일을 반환합니다.
 * endDateStr의 month(1-based)를 JS Date month(0-based)로 그대로 넘기면 자동으로 익월이 됩니다.
 */
export function calculatePaymentDate(endDateStr: string, payDay: number): Date {
  const [year, month] = endDateStr.split('-').map(Number);
  return new Date(year, month, payDay);
}
