import { supabase } from '@/lib/supabase';
import type { QueryData } from '@supabase/supabase-js';

export const activitiesQuery = (divisionId: number) =>
  supabase
    .from('activities')
    .select('id, name')
    .eq('division_id', divisionId)
    .order('updated_at', { ascending: false });

export type Activity = QueryData<ReturnType<typeof activitiesQuery>>[number];
