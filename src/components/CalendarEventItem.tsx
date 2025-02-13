import { BellIcon, RepeatIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, IconButton } from '@chakra-ui/react';

import { Event } from '../types';

interface CalendarEventItemProps {
  event: Event;
  isNotified: boolean;
  onSingleEdit: (updatedEvent: Event) => void;
  onSingleDelete: (id: string) => void;
  onEditRepeatingEvent: (updatedEvent: Event) => void;
  onDeleteRepeatingEvent: (repeatId: string) => void;
}

export const CalendarEventItem = ({
  event,
  isNotified,
  onSingleEdit,
  onSingleDelete,
  onEditRepeatingEvent,
  onDeleteRepeatingEvent,
}: CalendarEventItemProps) => {
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

  const handleEditRepeatingEvent = () => {
    onEditRepeatingEvent(event);
  };

  const handleDeleteRepeatingEvent = () => {
    if (event.repeat.id) {
      onDeleteRepeatingEvent(event.repeat.id);
    }
  };

  return (
    <Box p={1} my={1} bg={event.repeat.type !== 'none' ? 'blue.100' : 'gray.100'} borderRadius="md">
      <HStack spacing={1}>
        {isNotified && <BellIcon data-testid="bell-icon" />}
        {event.repeat.type !== 'none' && <RepeatIcon data-testid="repeat-icon" />}
        <Text fontSize="sm">{event.title}</Text>

        <IconButton aria-label="수정" icon={<EditIcon />} size="xs" onClick={handleSingleEdit} />
        <IconButton
          aria-label="삭제"
          icon={<DeleteIcon />}
          size="xs"
          onClick={() => onSingleDelete(event.id)}
        />

        {event.repeat.id && (
          <>
            <IconButton
              aria-label="Edit repeating event"
              icon={<EditIcon />}
              size="xs"
              onClick={handleEditRepeatingEvent}
            />
            <IconButton
              aria-label="Delete repeating event"
              icon={<DeleteIcon />}
              size="xs"
              onClick={handleDeleteRepeatingEvent}
            />
          </>
        )}
      </HStack>
    </Box>
  );
};
