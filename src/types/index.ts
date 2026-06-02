export interface Zone {
  id: string;
  name: string;
  price: number; // 배송 기본 단가
  freshBagPrice: number; // 프레쉬백 회수 개당 단가
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  deliveries: Record<string, number>; // { [zoneId]: 수량 }
  freshBagCount: number; // 프레쉬백 수량
}

export interface AppSettings {
  zones: Zone[];
  workDaysPerWeek: number; // 주당 근무일수
  restDaysOfWeek: number[]; // 기본 휴무 요일 (0~6)
  settlementStartDay: number; // 정산 시작일 (1~28)
  payDay: number; // 월급일
  freshBagIncentive: number; // 프레쉬백 인센티브 (원) — 하루 배송 매출에 가산
  commissionRate: number; // 회사 수수료율 (%)
}
