import { describe, it, expect, beforeEach } from 'vitest';

import { Event } from '../../types';
import { shouldExpandEvent } from '../../utils/repeatEventUtils';

describe('repeatEventUtils', () => {
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

  describe('shouldExpandEvent 테스트', () => {
    it('반복 설정이 없으면 false 반환', () => {
      expect(shouldExpandEvent(baseEvent)).toBe(false);
    });

    it('반복 설정이 있고 endDate가 있으면 true 반환', () => {
      baseEvent.repeat = { type: 'daily', interval: 1, endDate: '2025-01-10' };
      expect(shouldExpandEvent(baseEvent)).toBe(true);
    });

    it('repeat.type은 있지만 endDate가 없으면 false 반환', () => {
      baseEvent.repeat = { type: 'daily', interval: 1, endDate: '' };
      expect(shouldExpandEvent(baseEvent)).toBe(false);
    });
  });
});
