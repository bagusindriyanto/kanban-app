import { supabase } from '@/lib/supabase';
import type { QueryData } from '@supabase/supabase-js';

export const userQuery = () =>
  supabase
    .from('profiles')
    .select('user_id, name, full_name, avatar')
    .order('name');

export type User = QueryData<ReturnType<typeof userQuery>>[number];

export const currentUserQuery = (userId: string) =>
  supabase
    .from('profiles')
    .select(
      `
      user_id,
      name,
      full_name,
      avatar,
      nik,
      division_id,
      role: roles (name)
      `,
    )
    .eq('user_id', userId)
    .single();

export type CurrentUser = QueryData<ReturnType<typeof currentUserQuery>>;
