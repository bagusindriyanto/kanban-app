import { useMutation } from '@tanstack/react-query';
import { type MutationConfig } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { TaskUpdate } from '@/types/task';
import { taskKeys, type TaskKeys } from './queryKeys';
import type { TaskWithProfile } from './query';
import { userKeys } from '@/features/users/api/queryKeys';
import { scheduleTaskKeys } from '@/features/schedules/api/queryKeys';
import type { User } from '@/features/users/api/query';

export const updateTask = async (data: TaskUpdate) => {
  const { id, ...updatedData } = data;
  if (!id) throw new Error('ID task diperlukan');

  const { error } = await supabase
    .from('tasks')
    .update(updatedData)
    .eq('id', id);
  if (error) throw error;
};

type UpdateTaskContext = {
  previousTasks?: [TaskKeys, TaskWithProfile[] | undefined][];
};

type UseUpdateTaskParams = {
  mutationConfig?: Omit<
    MutationConfig<typeof updateTask>,
    'mutationFn' | 'onMutate' | 'onSettled'
  >;
};

export const useUpdateTask = ({
  mutationConfig = {},
}: UseUpdateTaskParams = {}) => {
  const { onError, ...restMutationConfig } = mutationConfig;

  return useMutation<void, Error, TaskUpdate, UpdateTaskContext>({
    mutationFn: updateTask,

    onMutate: async (updatedTask, context) => {
      await context.client.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = context.client.getQueriesData<TaskWithProfile[]>({
        queryKey: taskKeys.all,
      }) as [TaskKeys, TaskWithProfile[] | undefined][];

      const profiles = context.client.getQueryData<User[]>(userKeys.all);
      const updatedUser = profiles?.find(
        (profile) => profile.user_id === updatedTask.user_id,
      ) ?? {
        full_name: 'User',
        name: 'User',
        user_id: crypto.randomUUID(),
        avatar: null,
      };
      const updatedAssigner =
        profiles?.find(
          (profile) => profile.user_id === updatedTask.assigner_id,
        ) ?? null;

      previousTasks.forEach(([queryKey, oldTasks]) => {
        if (!oldTasks) return;

        const filters = queryKey[1];
        const matchedFilter =
          !filters?.user_id ||
          filters.user_id === 'all' ||
          filters.user_id === updatedTask.user_id;

        const exist = oldTasks.some((task) => task.id === updatedTask.id);

        if (!matchedFilter) {
          if (exist) {
            context.client.setQueryData(
              queryKey,
              oldTasks.filter((task) => task.id !== updatedTask.id),
            );
          }
          return;
        }

        context.client.setQueryData(
          queryKey,
          oldTasks
            .map(
              (task): TaskWithProfile =>
                task.id === updatedTask.id
                  ? {
                      ...task,
                      ...updatedTask,
                      updated_at: new Date().toISOString(),
                      user: updatedUser,
                      assigner: updatedAssigner
                        ? { name: updatedAssigner.name }
                        : null,
                      optimistic: true,
                    }
                  : task,
            )
            .sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime(),
            ),
        );
      });

      return { previousTasks };
    },

    onError: (err, updatedTask, onMutateResult, context) => {
      onMutateResult?.previousTasks?.forEach(([queryKey, data]) => {
        context.client.setQueryData(queryKey, data);
      });

      onError?.(err, updatedTask, onMutateResult, context);
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: taskKeys.all });
      context.client.invalidateQueries({ queryKey: scheduleTaskKeys.all });
    },

    ...restMutationConfig,
  });
};
