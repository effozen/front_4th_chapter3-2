import { describe, it, expect, beforeEach } from 'vitest';

import { Event } from '../../types';
import {
  generateDailyDates,
  generateWeeklyDates,
  generateMonthlyDates,
  generateYearlyDates,
  generateRepeatingDates,
  shouldExpandEvent,
} from '../../utils/repeatEventUtils';

describe('repeatEventUtils >', () => {
  let baseEvent: Event;

  beforeEach(() => {
    baseEvent = {
      id: 'test-event',
      title: '반복 일정',
      date: '2025-01-01', // 시작 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1, endDate: '' },
      notificationTime: 10,
    };
  });

  describe('shouldExpandEvent >', () => {
    it('반복 설정이 없으면 false 반환한다.', () => {
      expect(shouldExpandEvent(baseEvent)).toBe(false);
    });

    it('반복 설정이 있고 endDate가 있으면 true 반환한다.', () => {
      baseEvent.repeat = { type: 'daily', interval: 1, endDate: '2025-01-10' };
      expect(shouldExpandEvent(baseEvent)).toBe(true);
    });

    it('repeat.type은 있지만 endDate가 없으면 false 반환한다.', () => {
      baseEvent.repeat = { type: 'daily', interval: 1, endDate: '' };
      expect(shouldExpandEvent(baseEvent)).toBe(false);
    });
  });

  describe('매일 반복되는 일정 테스트(Daily)', () => {
    it('매일 반복을 할 경우에 대해서 정해진 기간까지 반복 일자를 출력한다.', () => {
      baseEvent.repeat = { type: 'daily', interval: 1, endDate: '2025-01-05' };
      expect(generateDailyDates(baseEvent)).toEqual([
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
      ]);
    });

    it('2일 간격으로 매일 반복할 경우 하루 건너 하루로 출력될 수 있도록 한다.', () => {
      baseEvent.repeat = { type: 'daily', interval: 2, endDate: '2025-01-10' };
      expect(generateDailyDates(baseEvent)).toEqual([
        '2025-01-03',
        '2025-01-05',
        '2025-01-07',
        '2025-01-09',
      ]);
    });
  });

  describe('매주 반복되는 일정 테스트(weekly)', () => {
    it('매주 반복하는 경우, 끝나는 날까지 7일 단위로 증가시킨 일정들을 반환한다.', () => {
      baseEvent.repeat = { type: 'weekly', interval: 1, endDate: '2025-02-01' };
      expect(generateWeeklyDates(baseEvent)).toEqual([
        '2025-01-08',
        '2025-01-15',
        '2025-01-22',
        '2025-01-29',
      ]);
    });

    it('2주 간격으로 반복하는 경우, 끝나는 날까지 14일 단위로 증가시킨 일정들을 반환한다.', () => {
      baseEvent.repeat = { type: 'weekly', interval: 2, endDate: '2025-02-01' };
      expect(generateWeeklyDates(baseEvent)).toEqual(['2025-01-15', '2025-01-29']);
    });
  });

  describe('매월 반복되는 일정 테스트(monthly)', () => {
    it('매월 반복하는 경우, 끝나는 날까지 한달 단위로 증가시킨 일정을 반환한다.', () => {
      baseEvent.repeat = { type: 'monthly', interval: 1, endDate: '2025-06-01' };
      expect(generateMonthlyDates(baseEvent)).toEqual([
        '2025-02-01',
        '2025-03-01',
        '2025-04-01',
        '2025-05-01',
        '2025-06-01',
      ]);
    });

    it('2개월 간격으로 반복하는 일정의 경우, 끝나는 날까지 2개월 단위로 증가시킨 일정을 반환한다.', () => {
      baseEvent.repeat = { type: 'monthly', interval: 2, endDate: '2025-06-01' };
      expect(generateMonthlyDates(baseEvent)).toEqual(['2025-03-01', '2025-05-01']);
    });

    it('31일에 시작한 일정이 존재하지 않는 월에서는 마지막 날로 조정해야 한다', () => {
      baseEvent.date = '2025-01-31';
      baseEvent.repeat = { type: 'monthly', interval: 1, endDate: '2025-06-30' };

      expect(generateMonthlyDates(baseEvent)).toEqual([
        '2025-02-28', // 2월은 28일
        '2025-03-31',
        '2025-04-30',
        '2025-05-31',
        '2025-06-30',
      ]);
    });
  });
});
