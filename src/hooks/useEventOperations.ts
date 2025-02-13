import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm, RepeatType } from '../types';
import { generateRepeatingDates, shouldExpandEvent } from '../utils/repeatEventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  /**
   * 📌 서버에서 일정 불러오기 & 반복 일정 확장
   */
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();

      // ✅ 반복 일정 확장 적용
      const expandedEvents = events.flatMap((event: Event) => {
        if (shouldExpandEvent(event)) {
          return generateRepeatingDates(event).map((date) => ({
            ...event,
            date,
            id: `${event.id}-${date}`, // 중복 방지를 위한 ID 변환
          }));
        }
        return event;
      });

      setEvents(expandedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * 📌 일정 저장 (반복 일정 포함)
   */
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;

      if (eventData.repeat.type !== 'none') {
        // ✅ 반복 일정 처리 → 여러 개의 일정 생성 후 전송
        const repeatDates = generateRepeatingDates(eventData as Event);
        const repeatEvents = repeatDates.map((date) => ({
          ...eventData,
          id: undefined, // 서버에서 ID 생성
          date,
        }));

        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: repeatEvents }),
        });
      } else {
        // ✅ 단일 일정 저장
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * 📌 일정 삭제 (단일 일정)
   */
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * 📌 반복 일정 **단일 수정** (특정 날짜만 수정)
   */
  async function singleEditEvent(updatedEvent: Event) {
    const newEvent = {
      ...updatedEvent,
      repeat: {
        type: 'none' as RepeatType, // 반복 일정 해제
        interval: 0,
        endDate: undefined,
      },
    };

    await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });

    setEvents((prev) => prev.map((evt) => (evt.id === updatedEvent.id ? newEvent : evt)));
  }

  /**
   * 📌 반복 일정 **단일 삭제** (특정 날짜만 삭제)
   */
  async function singleDeleteEvent(id: string) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });

    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  }

  /**
   * 📌 반복 일정 **전체 수정** (같은 `repeat.id` 가진 일정 모두 변경)
   */
  async function editRepeatingEvent(updatedEvent: Event) {
    try {
      const response = await fetch('/api/events-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [updatedEvent] }),
      });

      if (!response.ok) {
        throw new Error('Failed to update repeating events');
      }

      await fetchEvents();
      toast({
        title: '반복 일정이 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating repeating events:', error);
      toast({
        title: '반복 일정 수정 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  /**
   * 📌 반복 일정 **전체 삭제** (같은 `repeat.id` 가진 일정 모두 삭제)
   */
  async function deleteRepeatingEvent(repeatId: string) {
    try {
      const eventIds = events.filter((e) => e.repeat.id === repeatId).map((e) => e.id);

      const response = await fetch('/api/events-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete repeating events');
      }

      await fetchEvents();
      toast({
        title: '반복 일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting repeating events:', error);
      toast({
        title: '반복 일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }, []);

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    singleDeleteEvent,
    singleEditEvent,
    editRepeatingEvent,
    deleteRepeatingEvent,
  };
};
