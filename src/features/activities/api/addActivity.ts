import { useMutation } from '@tanstack/react-query';
import type { MutationConfig } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { ActivityInsert } from '@/types/activity';
import { activityKeys } from './queryKeys';

export const addActivity = async ({ name, division_id }: ActivityInsert) => {
  const { error } = await supabase
    .from('activities')
    .insert({ name, division_id });

  if (error) throw error;
};

type UseAddActivityParams = {
  mutationConfig?: Omit<
    MutationConfig<typeof addActivity>,
    'mutationFn' | 'onSuccess'
  >;
};

export const useAddActivity = (params: UseAddActivityParams = {}) => {
  return useMutation({
    mutationFn: addActivity,
    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: activityKeys.byDivision(variables.division_id),
      });
    },
    ...params.mutationConfig,
  });
};
