import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Date를 로컬 타임존 기준 YYYY-MM-DD 문자열로 변환합니다.
 * UTC 오프셋을 보정하여 한국 시간대에서 정확한 날짜를 반환합니다.
 */
export function toDateString(d: Date): string {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

