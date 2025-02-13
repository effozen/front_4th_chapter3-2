import { Event } from '../types';
import { formatDate, getDaysInMonth } from './dateUtils';

/**
 * 반복 일정 확장 여부 확인
 */
export const shouldExpandEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none' && !!event.repeat.endDate;
};

/**
 * 특정 이벤트에 대해 반복 날짜를 생성하는 함수
 */
export const generateRepeatingDates = (event: Event): string[] => {
  if (!shouldExpandEvent(event)) return [];
  const { type } = event.repeat;

  switch (type) {
    case 'daily':
      return generateDailyDates(event);
    case 'weekly':
      return generateWeeklyDates(event);
    case 'monthly':
      return generateMonthlyDates(event);
    case 'yearly':
      return generateYearlyDates(event);
    default:
      return [];
  }
};

/**
 * 공통 로직:
 *  - 현재 currentDate를 기반으로 새 Date 객체를 만들고,
 *  - interval을 적용해 "다음 반복 날짜"를 구한다.
 *  - 반환된 날짜가 endDate 이전이면 배열에 추가.
 */
function generateDates(
  event: Event,
  updateFn: (current: Date, interval: number) => Date
): string[] {
  const { date, endDate, interval } = {
    date: new Date(event.date),
    endDate: new Date(event.repeat.endDate!),
    interval: event.repeat.interval,
  };

  const results: string[] = [];
  let currentDate = new Date(date); // 시작일

  while (currentDate < endDate) {
    // 다음 반복 날짜 계산
    const nextDate = updateFn(currentDate, interval);

    // nextDate가 endDate 이하라면 배열에 추가
    if (nextDate <= endDate) {
      results.push(formatDate(nextDate));
    }

    // 다음 루프에서 사용
    currentDate = nextDate;
  }

  return results;
}

/**
 * 일간 반복 날짜 생성
 */
export const generateDailyDates = (event: Event): string[] => {
  return generateDates(event, (date, interval) => {
    const next = new Date(date);
    next.setDate(next.getDate() + interval);
    return next;
  });
};

/**
 * 주간 반복 날짜 생성
 */
export const generateWeeklyDates = (event: Event): string[] => {
  return generateDates(event, (date, interval) => {
    const next = new Date(date);
    next.setDate(next.getDate() + interval * 7);
    return next;
  });
};

/**
 * 월간 반복 날짜 생성
 * - "처음 설정된 일자"를 최대한 유지하려고 시도
 * - 만약 그 달에 해당 일자가 없으면 마지막 날로 조정
 */
export const generateMonthlyDates = (event: Event): string[] => {
  // "처음 설정된 day"를 계속 유지하고 싶다면, 아래처럼 별도 변수에 저장
  const originalDay = new Date(event.date).getDate();

  return generateDates(event, (date, interval) => {
    // 1) 새 "year, month" 계산
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth() + interval;

    // 2) 일단 1일로 설정하여 안전하게 "해당 달"로 이동
    const temp = new Date(targetYear, targetMonth, 1);

    // 3) 해당 달의 최대 일 수
    const maxDays = getDaysInMonth(temp.getFullYear(), temp.getMonth() + 1);

    // 4) "원하는 day"가 maxDays보다 크면 "마지막 날"로 조정
    const finalDay = Math.min(originalDay, maxDays);

    return new Date(temp.getFullYear(), temp.getMonth(), finalDay);
  });
};

/**
 * 연간 반복 날짜 생성
 * - 윤년 2월 29일 → 윤년 아닌 해엔 2월 28일로 보정
 */
export const generateYearlyDates = (event: Event): string[] => {
  const originalDay = new Date(event.date).getDate(); // 초기 "일(day)" 기억
  const originalMonth = new Date(event.date).getMonth(); // 초기 "월"

  return generateDates(event, (prevDate, interval) => {
    const newYear = prevDate.getFullYear() + interval;

    // 1) "연"만 바꿔서 임시로 1일 지정
    const temp = new Date(newYear, originalMonth, 1);

    // 2) 해당 연,월의 "최대 일 수"
    const maxDays = getDaysInMonth(temp.getFullYear(), temp.getMonth() + 1);

    // 3) 기존 originalDay가 maxDays보다 크면 → 마지막 날로
    const finalDay = Math.min(originalDay, maxDays);

    // 4) 최종 날짜 생성
    return new Date(temp.getFullYear(), temp.getMonth(), finalDay);
  });
};
