import { useMutation } from '@tanstack/react-query';
import { type MutationConfig } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { TaskInsert } from '@/types/task';
import { taskKeys, type TaskKeys } from './queryKeys';
import type { TaskWithProfile } from './query';
import { userKeys } from '@/features/users/api/queryKeys';
import { scheduleTaskKeys } from '@/features/schedules/api/queryKeys';
import type { User } from '@/features/users/api/query';

export const addTask = async (payload: TaskInsert[]) => {
  const { error } = await supabase.from('tasks').insert(payload);
  if (error) throw error;
};

type AddTaskContext = {
  previousTasks?: [TaskKeys, TaskWithProfile[] | undefined][];
};

type UseAddTaskParams = {
  mutationConfig?: Omit<
    MutationConfig<typeof addTask>,
    'mutationFn' | 'onMutate' | 'onError' | 'onSettled'
  >;
};

export const useAddTask = ({ mutationConfig }: UseAddTaskParams = {}) => {
  return useMutation<void, Error, TaskInsert[], AddTaskContext>({
    mutationFn: addTask,

    onMutate: async (newTasks, context) => {
      await context.client.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = context.client.getQueriesData<TaskWithProfile[]>({
        queryKey: taskKeys.all,
      }) as [TaskKeys, TaskWithProfile[] | undefined][];

      const profiles = context.client.getQueryData<User[]>(userKeys.all);
      const assignerId = newTasks[0]?.assigner_id;
      const newAssigner =
        profiles?.find((profile) => profile.user_id === assignerId) ?? null;
      const createdAt = new Date().toISOString();
      const baseId = Date.now();

      const optimisticTasks: TaskWithProfile[] = newTasks.map(
        (newTask, index) => {
          const newUser = profiles?.find(
            (profile) => profile.user_id === newTask.user_id,
          ) ?? {
            full_name: 'User',
            name: 'User',
            user_id: crypto.randomUUID(),
            avatar: null,
          };

          return {
            ...newTask,
            id: baseId + index,
            status: 'todo',
            detail: newTask.detail ?? null,
            timestamp_todo: createdAt,
            timestamp_progress: null,
            timestamp_done: null,
            minute_activity: 0,
            minute_pause: 0,
            scheduled_at: newTask.scheduled_at ?? null,
            pause_time: null,
            created_at: createdAt,
            updated_at: createdAt,
            assigner_id: newTask.assigner_id ?? null,
            user: newUser,
            assigner: newAssigner ? { name: newAssigner.name } : null,
            optimistic: true,
          };
        },
      );

      previousTasks.forEach(([queryKey, oldTasks]) => {
        if (!oldTasks) return;

        const filters = queryKey[1];
        if (!filters) return;

        const matchedTasks = optimisticTasks.filter(
          (task) =>
            !filters.user_id ||
            filters.user_id === 'all' ||
            filters.user_id === task.user_id,
        );

        if (matchedTasks.length === 0) return;

        context.client.setQueryData(queryKey, [...matchedTasks, ...oldTasks]);
      });

      return { previousTasks };
    },

    onError: (_err, _newTask, onMutateResult, context) => {
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
