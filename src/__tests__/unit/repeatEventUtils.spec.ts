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

  describe('매일 반복되는 일정 테스트', () => {
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
});
