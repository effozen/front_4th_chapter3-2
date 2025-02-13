import { BellIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../types';

export const CalendarEventItem = ({ event, isNotified }: { event: Event; isNotified: boolean }) => {
  return (
    <Box
      p={1}
      my={1}
      bg={event.repeat.type !== 'none' ? 'blue.100' : 'gray.100'}
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
      </HStack>
    </Box>
  );
};
