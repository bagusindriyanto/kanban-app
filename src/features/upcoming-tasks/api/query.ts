import { supabase } from '@/lib/supabase';
import type { QueryData } from '@supabase/supabase-js';
import { REMINDER_GRACE_MS } from '../constants';

export const upcomingTasksQuery = (userId: string) =>
  supabase
    .from('tasks')
    .select(
      `
    id,
    status,
    content,
    detail,
    scheduled_at
  `,
    )
    .eq('user_id', userId)
    .eq('status', 'todo')
    .gte('scheduled_at', new Date(Date.now() - REMINDER_GRACE_MS).toISOString())
    .order('scheduled_at', { ascending: true });

export type UpcomingTask = QueryData<
  ReturnType<typeof upcomingTasksQuery>
>[number];
