import { useEffect } from 'react';
import useNotificationStore from '@/stores/notificationStore';
import { useFetchUpcomingTasks } from '../api/fetchUpcomingTasks';
import type { UpcomingTask } from '../api/query';
import { UPCOMING_WINDOW_MINUTES } from '../constants';
import { useDeadlineChecker } from './useDeadlineChecker';

const EMPTY_TASKS: UpcomingTask[] = [];

export const useUpcomingTasks = () => {
  const { data } = useFetchUpcomingTasks();
  const tasks = data ?? EMPTY_TASKS;
  const now = useDeadlineChecker(tasks);
  const setUpcomingCount = useNotificationStore(
    (state) => state.setUpcomingCount,
  );

  const visibleTasks = tasks.filter((task) => {
    if (!task.scheduled_at) return false;
    const minutesUntilStart =
      (new Date(task.scheduled_at).getTime() - now) / 60000;
    return (
      minutesUntilStart > 0 && minutesUntilStart <= UPCOMING_WINDOW_MINUTES
    );
  });

  useEffect(() => {
    setUpcomingCount(visibleTasks.length);
  }, [setUpcomingCount, visibleTasks.length]);

  useEffect(() => () => setUpcomingCount(0), [setUpcomingCount]);

  return visibleTasks;
};
