import { useState } from 'react';
import type { EventClickInfo, EventInput } from '@fullcalendar/react';
import { isBefore, isToday } from 'date-fns';
import useAuthStore from '@/stores/authStore';
import { useFetchScheduleTasks } from '../api/fetchScheduleTasks';
import type { ScheduleScope, ScheduleStatus } from '../api/query';
import { statusColors } from '../constants/calendar';

export const useScheduleTasks = ({
  start,
  end,
}: {
  start: string;
  end: string;
}) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [scope, setScope] = useState<ScheduleScope>('all');
  const [status, setStatus] = useState<ScheduleStatus>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { data: tasks = [], error } = useFetchScheduleTasks({
    filters: {
      from: start,
      to: end,
      scope,
      status,
      userId: currentUser?.id ?? '',
    },
  });

  const events = tasks.map(
    (task): EventInput => ({
      id: String(task.id),
      title: task.content,
      start:
        task.status === 'todo' ? task.scheduled_at! : task.timestamp_progress!,
      end: task.timestamp_done ?? undefined,
      interactive: true,
      ...statusColors[task.status],
    }),
  );

  const scheduledToday = tasks.filter(
    (task) => task.scheduled_at && isToday(task.scheduled_at),
  ).length;

  const overdue = tasks.filter(
    (task) =>
      task.status !== 'done' &&
      task.scheduled_at &&
      isBefore(task.scheduled_at, new Date()),
  ).length;

  const handleEventClick = (info: EventClickInfo) => {
    setSelectedTaskId(Number(info.event.id));
  };

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const handleTaskDialogOpenChange = (open: boolean) => {
    if (!open) setSelectedTaskId(null);
  };

  const handleScopeChange = (value: ScheduleScope) => {
    setSelectedTaskId(null);
    setScope(value);
  };

  const handleStatusChange = (value: ScheduleStatus) => {
    setSelectedTaskId(null);
    setStatus(value);
  };

  return {
    scope,
    setScope: handleScopeChange,
    status,
    setStatus: handleStatusChange,
    events,
    error,
    taskCount: tasks.length,
    scheduledToday,
    overdue,
    selectedTask,
    handleEventClick,
    handleTaskDialogOpenChange,
  };
};
