import { renderHook, act } from '@testing-library/react';
import { describe, it } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { RepeatType } from '../../types.ts';

describe('useEventForm 테스트', () => {
  const Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-02-28',
    startTime: '12:00',
    endTime: '13:00',
    description: '테스트용 이벤트 점심입니다.',
    location: '서울',
    category: '일정',
    repeat: {
      type: 'weekly' as RepeatType,
      interval: 1,
      endDate: '2025-11-01',
    },
    notificationTime: 10,
  };

  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatType('daily');
    });

    expect(result.current.repeatType).toBe('daily');
  });

  it('일정 생성 또는 수정 시, 크기 제한 없이 반복 간격을 설정할 수 있다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatType('daily');
    });

    act(() => {
      result.current.setRepeatInterval(30000);
    });

    expect(result.current.repeatInterval).toBe(30000);
  });

  it('일정 생성 또는 수정 시, 0이하의 값을 선택하면 자동으로 1로 변환된다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatInterval(0);
    });

    expect(result.current.repeatInterval).toBe(1);
  });

  it('일정 생성 또는 수정 시, 반복 유형이 "none"일 때 반복 간격을 설정할 수 없다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatType('none');
    });

    act(() => {
      result.current.setRepeatInterval(5);
    });

    expect(result.current.repeatInterval).toBe(1);
  });

  // TODO: 반복 이후에 데이터를 보내야하는데 어떻게 보낼지 설정하고, 테스트코드를 재작성할것
  it('일정 생성 또는 수정 시, 매월 반복을 선택했을 경우 윤년 29일 또는 31일의 경우 자동으로 가까운 일을 선택한다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatType('monthly');
    });

    act(() => {
      result.current.setDate('2024-02-29');
    });

    expect(result.current.date).toBe('2024-02-28');

    act(() => {
      result.current.setDate('2024-03-31');
    });

    expect(result.current.date).toBe('2024-03-30');
  });

  it('캘린더에서 반복 일정을 확인할 수 있다.', () => {
    const { result } = renderHook(() => useEventForm(Event));

    act(() => {
      result.current.setRepeatType('weekly');
    });
  });
});

describe('', () => {});
