import { queryOptions, useQuery } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/queryClient';
import { scheduleTasksQuery, type ScheduleFilters } from './query';
import { scheduleTaskKeys } from './queryKeys';

export const fetchScheduleTasks = async (filters: ScheduleFilters) => {
  const { data, error } = await scheduleTasksQuery(filters);
  if (error) throw error;
  return data;
};

const fetchScheduleTasksQueryOptions = (filters: ScheduleFilters) =>
  queryOptions({
    queryKey: scheduleTaskKeys.filters(filters),
    queryFn: () => fetchScheduleTasks(filters),
    enabled: !!filters.userId,
    placeholderData: (previousData) => previousData,
  });

type UseFetchScheduleTasksParams = {
  filters: ScheduleFilters;
  queryConfig?: QueryConfig<typeof fetchScheduleTasksQueryOptions>;
};

export const useFetchScheduleTasks = ({
  filters,
  queryConfig,
}: UseFetchScheduleTasksParams) =>
  useQuery({
    ...fetchScheduleTasksQueryOptions(filters),
    ...queryConfig,
  });
