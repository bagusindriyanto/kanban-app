import { useMutation } from '@tanstack/react-query';
import { type MutationConfig } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { taskKeys, type TaskKeys } from './queryKeys';
import { scheduleTaskKeys } from '@/features/schedules/api/queryKeys';
import type { TaskWithProfile } from './query';

export const deleteTask = async (taskId: number) => {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
};

type DeleteTaskContext = {
  previousTasks?: [TaskKeys, TaskWithProfile[] | undefined][];
};

type UseDeleteTaskParams = {
  mutationConfig?: Omit<
    MutationConfig<typeof deleteTask>,
    'mutationFn' | 'onMutate' | 'onError' | 'onSettled'
  >;
};

export const useDeleteTask = ({ mutationConfig }: UseDeleteTaskParams = {}) => {
  return useMutation<void, Error, number, DeleteTaskContext>({
    mutationFn: deleteTask,
    onMutate: async (taskId, context) => {
      await context.client.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = context.client.getQueriesData<TaskWithProfile[]>({
        queryKey: taskKeys.all,
      }) as [TaskKeys, TaskWithProfile[] | undefined][];

      previousTasks.forEach(([queryKey, oldTasks]) => {
        if (!oldTasks) return;

        const exist = oldTasks.some((task) => task.id === taskId);
        if (!exist) return;

        context.client.setQueryData(
          queryKey,
          oldTasks.filter((task) => task.id !== taskId),
        );
      });

      return { previousTasks };
    },

    onError: (_err, _taskId, onMutateResult, context) => {
      onMutateResult?.previousTasks?.forEach(([queryKey, data]) => {
        context.client.setQueryData(queryKey, data);
      });
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: taskKeys.all });
      context.client.invalidateQueries({ queryKey: scheduleTaskKeys.all });
    },

    ...mutationConfig,
  });
};
