import { queryOptions, useQuery } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/queryClient';
import { activitiesQuery } from './query';
import { activityKeys } from './queryKeys';

export const fetchActivities = async (divisionId: number) => {
  const { data, error } = await activitiesQuery(divisionId);
  if (error) throw error;
  return data;
};

const fetchActivitiesQueryOptions = (divisionId: number) => {
  return queryOptions({
    queryKey: activityKeys.byDivision(divisionId),
    queryFn: () => fetchActivities(divisionId),
    enabled: !!divisionId,
  });
};

type UseFetchActivitiesParams = {
  divisionId?: number;
  queryConfig?: QueryConfig<typeof fetchActivitiesQueryOptions>;
};

export const useFetchActivities = ({
  divisionId,
  queryConfig,
}: UseFetchActivitiesParams = {}) => {
  return useQuery({
    ...fetchActivitiesQueryOptions(divisionId!),
    ...queryConfig,
  });
};
