import { Event } from '../../types';
import { expandRepeatingEvents } from '../../utils/eventUtils';

describe('expandRepeatingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '반복 일정',
    date: '2024-01-01', // 시작 날짜
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  };

  it('반복 설정이 없는 일정은 그대로 반환한다', () => {
    const events = [baseEvent];
    const result = expandRepeatingEvents(events, new Date('2024-01-01'), new Date('2024-12-31'));
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-01-01');
  });

  it('매일 반복 일정이 지정된 간격만큼 확장된다', () => {
    const dailyEvent = {
      ...baseEvent,
      repeat: { type: 'daily', interval: 2, endDate: '2024-01-10' },
    };

    const result = expandRepeatingEvents(
      [dailyEvent],
      new Date('2024-01-01'),
      new Date('2024-01-10')
    );

    expect(result).toHaveLength(5); // 1, 3, 5, 7, 9일 반복
    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2024-01-03',
      '2024-01-05',
      '2024-01-07',
      '2024-01-09',
    ]);
  });

  it('매주 반복 일정이 지정된 간격만큼 확장된다', () => {
    const weeklyEvent = {
      ...baseEvent,
      repeat: { type: 'weekly', interval: 1, endDate: '2024-02-01' },
    };

    const result = expandRepeatingEvents(
      [weeklyEvent],
      new Date('2024-01-01'),
      new Date('2024-02-01')
    );

    expect(result).toHaveLength(5); // 1월 1일, 8일, 15일, 22일, 29일
    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2024-01-08',
      '2024-01-15',
      '2024-01-22',
      '2024-01-29',
    ]);
  });

  it('매월 반복 일정에서 31일이 없는 달은 마지막 날짜로 조정된다', () => {
    const monthlyEvent = {
      ...baseEvent,
      date: '2024-01-31',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-06-30' },
    };

    const result = expandRepeatingEvents(
      [monthlyEvent],
      new Date('2024-01-01'),
      new Date('2024-06-30')
    );

    expect(result.map((e) => e.date)).toEqual([
      '2024-01-31',
      '2024-02-29', // 윤년이므로 29일 유지
      '2024-03-31',
      '2024-04-30', // 4월은 30일까지
      '2024-05-31',
      '2024-06-30',
    ]);
  });

  it('매년 반복 일정이 지정된 간격만큼 확장된다', () => {
    const yearlyEvent = {
      ...baseEvent,
      repeat: { type: 'yearly', interval: 1, endDate: '2027-01-01' },
    };

    const result = expandRepeatingEvents(
      [yearlyEvent],
      new Date('2024-01-01'),
      new Date('2027-01-01')
    );

    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2025-01-01',
      '2026-01-01',
      '2027-01-01',
    ]);
  });

  it('2월 29일이 윤년이 아닌 해에서는 2월 28일로 조정된다', () => {
    const leapYearEvent = {
      ...baseEvent,
      date: '2024-02-29',
      repeat: { type: 'yearly', interval: 1, endDate: '2027-02-29' },
    };

    const result = expandRepeatingEvents(
      [leapYearEvent],
      new Date('2024-01-01'),
      new Date('2027-02-28')
    );

    expect(result.map((e) => e.date)).toEqual(['2024-02-29', '2025-02-28', '2026-02-28']);
  });
});
