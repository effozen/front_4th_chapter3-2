import { BellIcon, RepeatIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, IconButton } from '@chakra-ui/react';

import { Event } from '../types';

/**
 * CalendarEventItemProps:
 * - event: 일정 정보
 * - isNotified: 알림 여부(알림이 도래한 일정인지)
 * - onSingleEdit: 반복 일정 "단일 수정" 시 호출 (repeat.type='none'으로 변경)
 * - onSingleDelete: 반복 일정 "단일 삭제" 시 호출 (해당 일정만 삭제)
 */
interface CalendarEventItemProps {
  event: Event;
  isNotified: boolean;
  onSingleEdit: (updatedEvent: Event) => void;
  onSingleDelete: (id: string) => void;
}

export const CalendarEventItem = ({
  event,
  isNotified,
  onSingleEdit,
  onSingleDelete,
}: CalendarEventItemProps) => {
  // "단일 수정" 버튼 클릭 시 → repeat를 none으로 변경
  const handleSingleEdit = () => {
    const updatedEvent: Event = {
      ...event,
      repeat: {
        type: 'none',
        interval: 0,
        endDate: undefined,
      },
    };
    onSingleEdit(updatedEvent);
  };

  return (
    <Box
      p={1}
      my={1}
      bg={event.repeat.type !== 'none' ? 'blue.100' : 'gray.100'} // 반복 일정일 때 파란 배경
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon data-testid="bell-icon" />}
        {event.repeat.type !== 'none' && <RepeatIcon data-testid="repeat-icon" />}

        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>

        {/* 단일 수정 버튼 */}
        <IconButton aria-label="수정" icon={<EditIcon />} size="xs" onClick={handleSingleEdit} />

        {/* 단일 삭제 버튼 */}
        <IconButton
          aria-label="삭제"
          icon={<DeleteIcon />}
          size="xs"
          onClick={() => onSingleDelete(event.id)}
        />
      </HStack>
    </Box>
  );
};
