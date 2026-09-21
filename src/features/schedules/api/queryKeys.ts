import type { ScheduleFilters } from './query';

export const scheduleTaskKeys = {
  all: ['schedule-tasks'] as const,
  filters: (filters: ScheduleFilters) =>
    [...scheduleTaskKeys.all, filters] as const,
};
