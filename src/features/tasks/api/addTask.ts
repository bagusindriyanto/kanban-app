import { useMutation } from '@tanstack/react-query';
import { type MutationConfig } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { TaskInsert } from '@/types/task';
import { taskKeys, type TaskKeys } from './queryKeys';
import type { TaskWithProfile } from './query';
import { userKeys } from '@/features/users/api/queryKeys';
import { scheduleTaskKeys } from '@/features/schedules/api/queryKeys';
import type { User } from '@/features/users/api/query';

export const addTask = async (payload: TaskInsert) => {
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
  return useMutation<void, Error, TaskInsert, AddTaskContext>({
    mutationFn: addTask,

    onMutate: async (newTask, context) => {
      await context.client.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = context.client.getQueriesData<TaskWithProfile[]>({
        queryKey: taskKeys.all,
      }) as [TaskKeys, TaskWithProfile[] | undefined][];

      const profiles = context.client.getQueryData<User[]>(userKeys.all);
      const newUser = profiles?.find(
        (profile) => profile.user_id === newTask.user_id,
      ) ?? {
        full_name: 'User',
        name: 'User',
        user_id: crypto.randomUUID(),
        avatar: null,
      };
      const newAssigner =
        profiles?.find((profile) => profile.user_id === newTask.assigner_id) ??
        null;

      previousTasks.forEach(([queryKey, oldTasks]) => {
        if (!oldTasks) return;

        const filters = queryKey[1];
        if (!filters) return;

        const matchedFilter =
          !filters?.user_id ||
          filters.user_id === 'all' ||
          filters.user_id === newTask.user_id;

        if (!matchedFilter) return;

        const optimisticTask: TaskWithProfile = {
          ...newTask,
          id: Date.now(),
          status: 'todo',
          detail: newTask.detail ?? null,
          timestamp_todo: new Date().toISOString(),
          timestamp_progress: null,
          timestamp_done: null,
          minute_activity: 0,
          minute_pause: 0,
          scheduled_at: newTask.scheduled_at ?? null,
          pause_time: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assigner_id: newTask.assigner_id ?? null,
          user: newUser,
          assigner: newAssigner ? { name: newAssigner.name } : null,
          optimistic: true,
        };

        context.client.setQueryData(queryKey, [optimisticTask, ...oldTasks]);
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
