import type { QueryData } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { TaskStatus } from '@/types/task';

export type ScheduleScope = 'all' | 'mine' | 'assigned';
export type ScheduleStatus = 'active' | 'all' | TaskStatus;

export type ScheduleFilters = {
  from: string;
  to: string;
  scope: ScheduleScope;
  status: ScheduleStatus;
  userId: string;
};

export const scheduleTasksQuery = (filters: ScheduleFilters) => {
  let query = supabase
    .from('tasks')
    .select(
      `
        *,
        user:profiles!tasks_user_id_fkey (
          user_id,
          full_name,
          name,
          avatar,
          role:roles (name)
        ),
        assigner:profiles!tasks_assigner_id_fkey (
          user_id,
          full_name,
          name,
          avatar,
          role:roles (name)
        )
      `,
    )
    .gte('scheduled_at', filters.from)
    .lt('scheduled_at', filters.to);

  if (filters.scope === 'mine') query = query.eq('user_id', filters.userId);
  if (filters.scope === 'assigned')
    query = query.eq('assigner_id', filters.userId);

  if (filters.status === 'active') query = query.neq('status', 'done');
  if (!['active', 'all'].includes(filters.status))
    query = query.eq('status', filters.status as TaskStatus);

  return query.order('scheduled_at', { ascending: true });
};

export type ScheduleTask = QueryData<
  ReturnType<typeof scheduleTasksQuery>
>[number];
