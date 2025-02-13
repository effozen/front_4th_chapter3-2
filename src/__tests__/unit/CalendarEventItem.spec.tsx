import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

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

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  test('반복 일정일 때 아이콘이 표시되는지 확인', () => {
    renderWithChakra(<CalendarEventItem event={mockEvent} isNotified={false} />);

    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
  });

  test('알림이 있을 때 Bell 아이콘이 표시되는지 확인', () => {
    renderWithChakra(<CalendarEventItem event={mockEvent} isNotified={true} />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  test('반복 일정이 아닐 때 아이콘이 없는지 확인', () => {
    const nonRepeatingEvent = { ...mockEvent, repeat: { type: 'none', interval: 0 } };
    renderWithChakra(<CalendarEventItem event={nonRepeatingEvent} isNotified={false} />);

    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
  });

  test('일정 제목이 정상적으로 렌더링되는지 확인', () => {
    renderWithChakra(<CalendarEventItem event={mockEvent} isNotified={false} />);
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
  });
});
