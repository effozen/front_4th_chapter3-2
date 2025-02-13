import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { CalendarEventItem } from '../../components/CalendarEventItem';
import { Event } from '../../types';

describe('CalendarEventItem', () => {
  const mockEvent: Event = {
    id: '1',
    title: '회의 일정',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 회의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 10,
  };

  const renderWithChakra = (ui: React.ReactElement) =>
    render(<ChakraProvider>{ui}</ChakraProvider>);

  it('반복 일정이면 repeat-icon이 표시된다', () => {
    // 필수 props 넘겨주기
    const onSingleEdit = vi.fn();
    const onSingleDelete = vi.fn();

    renderWithChakra(
      <CalendarEventItem
        event={mockEvent}
        isNotified={false}
        onSingleEdit={onSingleEdit}
        onSingleDelete={onSingleDelete}
      />
    );
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
  });

  it('알림이 있을 때 bell-icon이 표시된다', () => {
    const onSingleEdit = vi.fn();
    const onSingleDelete = vi.fn();

    renderWithChakra(
      <CalendarEventItem
        event={mockEvent}
        isNotified={true}
        onSingleEdit={onSingleEdit}
        onSingleDelete={onSingleDelete}
      />
    );
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('repeat.type=none인 경우 repeat-icon이 표시되지 않는다', () => {
    const onSingleEdit = vi.fn();
    const onSingleDelete = vi.fn();
    const nonRepeatingEvent = {
      ...mockEvent,
      repeat: { type: 'none', interval: 0 },
    };

    renderWithChakra(
      <CalendarEventItem
        event={nonRepeatingEvent}
        isNotified={false}
        onSingleEdit={onSingleEdit}
        onSingleDelete={onSingleDelete}
      />
    );
    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
  });

  it('단일 수정 클릭 시 onSingleEdit 호출 & repeat: none으로 변경', () => {
    const onSingleEdit = vi.fn();
    const onSingleDelete = vi.fn();

    renderWithChakra(
      <CalendarEventItem
        event={mockEvent}
        isNotified={false}
        onSingleEdit={onSingleEdit}
        onSingleDelete={onSingleDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: '수정' });
    fireEvent.click(editButton);

    // onSingleEdit가 호출됐는지 확인
    expect(onSingleEdit).toHaveBeenCalledTimes(1);

    // 인자로 넘긴 updatedEvent는 repeat.type='none'이어야 함
    const updatedEvent = onSingleEdit.mock.calls[0][0];
    expect(updatedEvent.repeat.type).toBe('none');
  });

  it('단일 삭제 클릭 시 onSingleDelete 호출', () => {
    const onSingleEdit = vi.fn();
    const onSingleDelete = vi.fn();

    renderWithChakra(
      <CalendarEventItem
        event={mockEvent}
        isNotified={false}
        onSingleEdit={onSingleEdit}
        onSingleDelete={onSingleDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(deleteButton);

    // onSingleDelete가 호출됐는지 확인
    expect(onSingleDelete).toHaveBeenCalledTimes(1);
    expect(onSingleDelete).toHaveBeenCalledWith(mockEvent.id);
  });
});
