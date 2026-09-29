


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."task_status" AS ENUM (
    'todo',
    'on progress',
    'done'
);


ALTER TYPE "public"."task_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_dashboard_get_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with
  division_users as (
    select p.user_id as id, p.full_name
    from public.profiles p
    where p.division_id = p_division_id
  ),
  date_series as (
    select generate_series(p_from, p_to, interval '1 day')::date as d
  ),
  division_tasks as (
    select
      t.user_id,
      t.timestamp_progress::date as d,
      public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time,
        t.minute_pause, t.minute_activity
      ) as effective_minute
    from public.tasks t
    where t.user_id in (select id from division_users)
      and t.status <> 'todo'
      and t.timestamp_progress::date >= p_from
      and t.timestamp_progress::date <= p_to
  ),
  chart_task_minutes as (
    select user_id, d, sum(effective_minute)::int as effective_minute
    from division_tasks
    group by user_id, d
  ),
  division_work_times as (
    select w.user_id, w.date, w.working_minute
    from public.work_times w
    where w.user_id in (select id from division_users)
      and w.date >= p_from
      and w.date <= p_to
  ),
  chart_grid as (
    select u.id as user_id, u.full_name, ds.d
    from division_users u
    cross join date_series ds
  ),
  chart_data as (
    select
      g.user_id,
      g.full_name,
      g.d,
      coalesce(ctm.effective_minute, 0) as effective_minute,
      coalesce(w.working_minute, 0)     as working_minute
    from chart_grid g
    left join chart_task_minutes ctm
      on ctm.user_id = g.user_id and ctm.d = g.d
    left join division_work_times w
      on w.user_id = g.user_id and w.date = g.d
  ),
  max_minute as (
    select coalesce(
      ceil(max(greatest(effective_minute, working_minute))::numeric / 60) * 60,
      0
    ) as value
    from chart_data
  )
  select jsonb_build_object(
    'max_minute', (select value from max_minute),
    'charts', coalesce(
      (select jsonb_agg(jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'chart_data', (
            select jsonb_agg(jsonb_build_object(
                'date', to_char(cd.d, 'YYYY-MM-DD'),
                'effective_minute', cd.effective_minute,
                'working_minute', cd.working_minute
              ) order by cd.d)
            from chart_data cd
            where cd.user_id = u.id
          )
        ) order by u.full_name)
       from division_users u),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."_dashboard_get_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") IS 'Internal helper for get_dashboard_overview. Not exposed as RPC.';



CREATE OR REPLACE FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
  v_days int;
  v_prev_from date;
  v_prev_to date;
  v_current jsonb;
  v_previous jsonb;
  c_done int; c_total int; c_eff numeric; c_work numeric;
  p_done int; p_total int; p_eff numeric; p_work numeric;
begin
  v_days := (p_to - p_from) + 1;
  v_prev_to := p_from - 1;
  v_prev_from := v_prev_to - v_days + 1;

  v_current := public._dashboard_period_summary(p_division_id, p_from, p_to);
  v_previous := public._dashboard_period_summary(p_division_id, v_prev_from, v_prev_to);

  c_done := (v_current ->> 'done')::int;
  c_total := (v_current ->> 'total')::int;
  c_eff  := (v_current ->> 'effective_minute')::numeric;
  c_work := (v_current ->> 'working_minute')::numeric;
  p_done := (v_previous ->> 'done')::int;
  p_total := (v_previous ->> 'total')::int;
  p_eff  := (v_previous ->> 'effective_minute')::numeric;
  p_work := (v_previous ->> 'working_minute')::numeric;

  select jsonb_build_object(
    'current', v_current,
    'previous', v_previous,
    'period', jsonb_build_object(
      'current', jsonb_build_object(
        'from', to_char(p_from, 'YYYY-MM-DD'),
        'to', to_char(p_to, 'YYYY-MM-DD')),
      'previous', jsonb_build_object(
        'from', to_char(v_prev_from, 'YYYY-MM-DD'),
        'to', to_char(v_prev_to, 'YYYY-MM-DD'))
    ),
    'deltas', jsonb_build_object(
      'done', case when p_done > 0
        then round(((c_done - p_done)::numeric / p_done) * 100, 1) else null end,
      'total', case when p_total > 0
        then round(((c_total - p_total)::numeric / p_total) * 100, 1) else null end,
      'effective_minute', case when p_eff > 0
        then round(((c_eff - p_eff)::numeric / p_eff) * 100, 1) else null end,
      'working_minute', case when p_work > 0
        then round(((c_work - p_work)::numeric / p_work) * 100, 1) else null end
    )
  ) into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
  v_mon_fri int;
  v_sat int;
  v_baseline bigint;
begin
  select
    count(*) filter (where extract(isodow from d) < 6),
    count(*) filter (where extract(isodow from d) = 6)
  into v_mon_fri, v_sat
  from generate_series(p_from, p_to, interval '1 day') d;

  v_baseline := v_mon_fri * 450 + v_sat * 300;

  with
  division_users as (
    select p.user_id as id, p.full_name, p.avatar
    from public.profiles p
    where p.division_id = p_division_id
  ),
  user_work as (
    select w.user_id, sum(w.working_minute) as working_minute
    from public.work_times w
    where w.user_id in (select id from division_users)
      and w.date between p_from and p_to
    group by w.user_id
  ),
  user_effective as (
    select
      t.user_id,
      sum(public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time, t.minute_pause, t.minute_activity
      )) as effective_minute
    from public.tasks t
    where t.user_id in (select id from division_users)
      and t.status <> 'todo'
      and t.timestamp_progress::date between p_from and p_to
    group by t.user_id
  ),
  per_user as (
    select
      u.id,
      u.full_name,
      u.avatar,
      coalesce(w.working_minute, 0) as working_minute,
      coalesce(e.effective_minute, 0) as effective_minute
    from division_users u
    left join user_work w on w.user_id = u.id
    left join user_effective e on e.user_id = u.id
  )
  select jsonb_build_object(
    'baseline_minutes', v_baseline,
    'working_days', jsonb_build_object('mon_fri', v_mon_fri, 'saturday', v_sat),
    'summary', (
      select jsonb_build_object(
        'utilized_fte', case when v_baseline > 0
          then round(sum(working_minute)::numeric / v_baseline, 2) else 0 end,
        'productive_fte', case when v_baseline > 0
          then round(sum(effective_minute)::numeric / v_baseline, 2) else 0 end
      )
      from per_user
    ),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'avatar', u.avatar,
        'working_minute', u.working_minute,
        'effective_minute', u.effective_minute,
        'utilized_fte', case when v_baseline > 0
          then round(u.working_minute::numeric / v_baseline, 2) else 0 end,
        'productive_fte', case when v_baseline > 0
          then round(u.effective_minute::numeric / v_baseline, 2) else 0 end
      ) order by u.full_name)
      from per_user u),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_dashboard_get_pie_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with
  division_users as (
    select p.user_id as id, p.full_name, p.avatar
    from public.profiles p
    where p.division_id = p_division_id
  ),
  task_minutes as (
    select
      t.user_id,
      t.content,
      public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time,
        t.minute_pause, t.minute_activity
      ) as effective_minute
    from public.tasks t
    where t.user_id in (select id from division_users)
      and t.status <> 'todo'
      and t.timestamp_progress::date >= p_from
      and t.timestamp_progress::date <= p_to
  ),
  aggregated as (
    select
      user_id,
      content,
      sum(effective_minute)::int as effective_minute,
      count(*)::int              as tasks_count
    from task_minutes
    group by user_id, content
    having sum(effective_minute) > 0
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',        u.id,
        'full_name', u.full_name,
        'avatar',    u.avatar,
        'tasks', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'content',          a.content,
                'effective_minute', a.effective_minute,
                'tasks_count',      a.tasks_count
              ) order by a.effective_minute desc
            )
            from aggregated a
            where a.user_id = u.id
          ),
          '[]'::jsonb
        )
      ) order by u.full_name
    ),
    '[]'::jsonb
  )
  into v_result
  from division_users u;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_pie_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."_dashboard_get_pie_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") IS 'Internal helper for get_dashboard_pie_chart. Not exposed as RPC.';



CREATE OR REPLACE FUNCTION "public"."_dashboard_get_stats"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with
  division_users as (
    select p.user_id as id, p.full_name, p.avatar
    from public.profiles p
    where p.division_id = p_division_id
  ),
  division_tasks as (
    select
      t.user_id,
      t.status,
      public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time,
        t.minute_pause, t.minute_activity
      ) as effective_minute
    from public.tasks t
    where t.user_id in (select id from division_users)
      and (
        t.status = 'todo'
        or (t.status <> 'todo'
            and t.timestamp_progress::date >= p_from
            and t.timestamp_progress::date <= p_to)
      )
  ),
  division_work_times as (
    select w.user_id, w.working_minute
    from public.work_times w
    where w.user_id in (select id from division_users)
      and w.date >= p_from
      and w.date <= p_to
  ),
  stats_per_user as (
    select
      u.id,
      u.full_name,
      u.avatar,
      count(*) filter (where t.status = 'todo')        as todo,
      count(*) filter (where t.status = 'on progress') as on_progress,
      count(*) filter (where t.status = 'done')         as done,
      count(t.user_id)                                  as total,
      coalesce(sum(t.effective_minute), 0)               as effective_minute,
      coalesce((select sum(w.working_minute)
                from division_work_times w
                where w.user_id = u.id), 0)               as working_minute
    from division_users u
    left join division_tasks t on t.user_id = u.id
    group by u.id, u.full_name, u.avatar
  )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'todo',             coalesce(sum(todo), 0),
      'on_progress',      coalesce(sum(on_progress), 0),
      'done',             coalesce(sum(done), 0),
      'total',            coalesce(sum(total), 0),
      'effective_minute', coalesce(sum(effective_minute), 0),
      'working_minute',   coalesce(sum(working_minute), 0)
    ),
    'users', coalesce(
      (select jsonb_agg(jsonb_build_object(
          'id', s.id,
          'full_name', s.full_name,
          'avatar', s.avatar,
          'todo', s.todo,
          'on_progress', s.on_progress,
          'done', s.done,
          'total', s.total,
          'effective_minute', s.effective_minute,
          'working_minute', s.working_minute
        ) order by s.full_name)
       from stats_per_user s),
      '[]'::jsonb
    )
  )
  into v_result
  from stats_per_user;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_stats"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."_dashboard_get_stats"("p_division_id" bigint, "p_from" "date", "p_to" "date") IS 'Internal helper for get_dashboard_overview. Not exposed as RPC.';



CREATE OR REPLACE FUNCTION "public"."_dashboard_get_table"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with
  division_users as (
    select p.user_id as id, p.full_name, p.avatar, r.name as role
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.division_id = p_division_id
  ),
  division_tasks as (
    select
      t.user_id,
      t.content,
      public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time,
        t.minute_pause, t.minute_activity
      ) as effective_minute
    from public.tasks t
    where t.user_id in (select id from division_users)
      and t.status <> 'todo'
      and t.timestamp_progress::date >= p_from
      and t.timestamp_progress::date <= p_to
  ),
  table_rows as (
    select
      user_id,
      content,
      sum(effective_minute)::int                as sum_effective_minute,
      round(avg(effective_minute)::numeric, 2)  as avg_effective_minute,
      count(*)                                  as tasks_count
    from division_tasks
    group by user_id, content
  )
  select jsonb_build_object(
    'rows', coalesce(
      (select jsonb_agg(jsonb_build_object(
          'user_id', r.user_id,
          'content', r.content,
          'sum_effective_minute', r.sum_effective_minute,
          'avg_effective_minute', r.avg_effective_minute,
          'tasks_count', r.tasks_count,
          'user', (
            select jsonb_build_object(
              'id', u.id,
              'profile', jsonb_build_object(
                'full_name', u.full_name,
                'avatar', u.avatar
              ),
              'role', u.role
            )
            from division_users u
            where u.id = r.user_id
          )
        ))
       from table_rows r),
      '[]'::jsonb
    ),
    'rows_count', (select count(*) from table_rows)
  )
  into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_table"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."_dashboard_get_table"("p_division_id" bigint, "p_from" "date", "p_to" "date") IS 'Internal helper for get_dashboard_overview. Not exposed as RPC.';



CREATE OR REPLACE FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with
  division_users as (
    select p.user_id as id, p.full_name, p.avatar
    from public.profiles p
    where p.division_id = p_division_id
  ),
  division_done_tasks as (
    select
      t.user_id,
      t.timestamp_todo,
      t.timestamp_progress,
      t.timestamp_done,
      t.minute_pause,
      t.minute_activity
    from public.tasks t
    where t.user_id in (select id from division_users)
      and t.status = 'done'
      and t.timestamp_progress::date >= p_from
      and t.timestamp_progress::date <= p_to
  ),
  per_user as (
    select
      u.id,
      u.full_name,
      u.avatar,
      count(dt.user_id) as tasks_count,
      coalesce(
        round(avg(extract(epoch from (dt.timestamp_done - dt.timestamp_todo)) / 60)::numeric, 1),
        0
      ) as avg_cycle_minutes,
      coalesce(
        round(avg(extract(epoch from (dt.timestamp_progress - dt.timestamp_todo)) / 60)::numeric, 1),
        0
      ) as avg_time_to_start_minutes,
      coalesce(
        round(avg(extract(epoch from (dt.timestamp_done - dt.timestamp_progress)) / 60)::numeric, 1),
        0
      ) as avg_processing_minutes,
      coalesce(round(avg(dt.minute_pause)::numeric, 1), 0) as avg_pause_minutes,
      coalesce(sum(dt.minute_activity), 0) as effective_minute,
      coalesce(sum(dt.minute_pause), 0) as pause_minute
    from division_users u
    left join division_done_tasks dt on dt.user_id = u.id
    group by u.id, u.full_name, u.avatar
  ),
  division_totals as (
    select
      sum(tasks_count) as tasks_count,
      sum(avg_cycle_minutes * tasks_count) as total_cycle,
      sum(avg_time_to_start_minutes * tasks_count) as total_t2s,
      sum(avg_processing_minutes * tasks_count) as total_proc,
      sum(avg_pause_minutes * tasks_count) as total_pause,
      sum(effective_minute) as effective_minute,
      sum(pause_minute) as pause_minute
    from per_user
  )
  select jsonb_build_object(
    'summary', (
      select jsonb_build_object(
        'tasks_count', coalesce(sum(tasks_count), 0),
        'avg_cycle_minutes', coalesce(
          round((sum(total_cycle) / nullif(sum(tasks_count), 0))::numeric, 1), 0),
        'avg_time_to_start_minutes', coalesce(
          round((sum(total_t2s) / nullif(sum(tasks_count), 0))::numeric, 1), 0),
        'avg_processing_minutes', coalesce(
          round((sum(total_proc) / nullif(sum(tasks_count), 0))::numeric, 1), 0),
        'avg_pause_minutes', coalesce(
          round((sum(total_pause) / nullif(sum(tasks_count), 0))::numeric, 1), 0),
        'pause_ratio', coalesce(
          round(
            (sum(pause_minute)::numeric
              / nullif(sum(effective_minute) + sum(pause_minute), 0)) * 100,
            1
          ), 0)
      )
      from division_totals
    ),
    'users', coalesce(
      (select jsonb_agg(jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'avatar', u.avatar,
          'tasks_count', u.tasks_count,
          'avg_cycle_minutes', u.avg_cycle_minutes,
          'avg_time_to_start_minutes', u.avg_time_to_start_minutes,
          'avg_processing_minutes', u.avg_processing_minutes,
          'avg_pause_minutes', u.avg_pause_minutes,
          'pause_ratio', case
            when u.effective_minute + u.pause_minute > 0
              then round((u.pause_minute::numeric / (u.effective_minute + u.pause_minute)) * 100, 1)
            else 0
          end
        ) order by u.full_name)
       from per_user u),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
declare
  v_result jsonb;
begin
  with division_users as (
    select user_id from public.profiles where division_id = p_division_id
  )
  select jsonb_build_object(
    'done', coalesce((
      select count(*)
      from public.tasks t
      where t.user_id in (select user_id from division_users)
        and t.status = 'done'
        and t.timestamp_progress::date between p_from and p_to
    ), 0),
    'total', coalesce((
      select count(*)
      from public.tasks t
      where t.user_id in (select user_id from division_users)
        and (
          (t.status = 'done' and t.timestamp_progress::date between p_from and p_to)
          or t.created_at::date between p_from and p_to
        )
    ), 0),
    'effective_minute', coalesce((
      select sum(public.task_effective_minute(
        t.status, t.timestamp_progress, t.pause_time, t.minute_pause, t.minute_activity))
      from public.tasks t
      where t.user_id in (select user_id from division_users)
        and t.status <> 'todo'
        and t.timestamp_progress::date between p_from and p_to
    ), 0),
    'working_minute', coalesce((
      select sum(w.working_minute)
      from public.work_times w
      where w.user_id in (select user_id from division_users)
        and w.date between p_from and p_to
    ), 0)
  ) into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_overview"("p_from_date" "date" DEFAULT NULL::"date", "p_to_date" "date" DEFAULT NULL::"date") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  v_user_id       uuid := auth.uid();
  v_division_id   bigint;
  v_division_name text;
  v_to            date;
  v_from          date;
begin
  if v_user_id is null then
    raise exception 'Harap login terlebih dahulu' using errcode = '28000';
  end if;

  select p.division_id into v_division_id
  from public.profiles p
  where p.user_id = v_user_id;

  if v_division_id is null then
    raise exception 'Profil atau divisi tidak ditemukan' using errcode = 'P0002';
  end if;

  select d.name into v_division_name
  from public.divisions d
  where d.id = v_division_id;

  v_to   := coalesce(p_to_date, current_date);
  v_from := coalesce(p_from_date, v_to - interval '30 days');

  return jsonb_build_object(
    'division', v_division_name,
    'stats',    public._dashboard_get_stats(v_division_id, v_from, v_to),
    'table',    public._dashboard_get_table(v_division_id, v_from, v_to),
    'chart',    public._dashboard_get_chart(v_division_id, v_from, v_to),
    'pie_chart',  public._dashboard_get_pie_chart(v_division_id, v_from, v_to),
    'time_metrics', public._dashboard_get_time_metrics(v_division_id, v_from, v_to),
    'comparison', public._dashboard_get_comparison(v_division_id, v_from, v_to),
    'fte', public._dashboard_get_fte(v_division_id, v_from, v_to)
  );
end;$$;


ALTER FUNCTION "public"."get_dashboard_overview"("p_from_date" "date", "p_to_date" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_overview"("p_from_date" "date", "p_to_date" "date") IS 'Setara DashboardController::overview(). Dipanggil via supabase.rpc("get_dashboard_overview", {p_from_date, p_to_date}). Menggunakan auth.uid() untuk resolve divisi user login.';



CREATE OR REPLACE FUNCTION "public"."get_my_division_id"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select division_id
  from profiles
  where user_id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_division_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) RETURNS bigint
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  select case
    when p_status = 'on progress' and p_pause_time is null then
      greatest(
        (extract(epoch from (now() - p_timestamp_progress)) / 60)::bigint
          - coalesce(p_minute_pause, 0),
        0
      )
    when p_status = 'on progress' and p_pause_time is not null then
      greatest(
        (extract(epoch from (p_pause_time - p_timestamp_progress)) / 60)::bigint
          - coalesce(p_minute_pause, 0),
        0
      )
    when p_status = 'done' then
      greatest(coalesce(p_minute_activity, 0), 0)
    else 0
  end
$$;


ALTER FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) IS 'Portasi dari Task::effectiveMinuteRaw() (Laravel). Menghitung menit efektif per task berdasarkan status.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "division_id" integer NOT NULL
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."activities" IS 'List of all activities';



ALTER TABLE "public"."activities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."activities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."divisions" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."divisions" OWNER TO "postgres";


COMMENT ON TABLE "public"."divisions" IS 'List of all divisions';



ALTER TABLE "public"."divisions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."divisions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "nik" "text",
    "avatar" "text",
    "division_id" integer,
    "role_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User''s profile';



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "level" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."roles" IS 'User''s role (e.g. Staff, Supervisor, Manager)';



ALTER TABLE "public"."roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" bigint NOT NULL,
    "content" "text" NOT NULL,
    "detail" "text",
    "status" "public"."task_status" DEFAULT 'todo'::"public"."task_status" NOT NULL,
    "timestamp_todo" timestamp with time zone DEFAULT "now"() NOT NULL,
    "timestamp_progress" timestamp with time zone,
    "timestamp_done" timestamp with time zone,
    "minute_pause" bigint DEFAULT '0'::bigint NOT NULL,
    "minute_activity" bigint DEFAULT '0'::bigint NOT NULL,
    "pause_time" timestamp with time zone,
    "scheduled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assigner_id" "uuid"
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


COMMENT ON TABLE "public"."tasks" IS 'All of user''s tasks';



ALTER TABLE "public"."tasks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tasks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."work_times" (
    "id" bigint NOT NULL,
    "date" "date" NOT NULL,
    "working_minute" bigint DEFAULT '0'::bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."work_times" OWNER TO "postgres";


COMMENT ON TABLE "public"."work_times" IS 'Total user''s work time every day';



ALTER TABLE "public"."work_times" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."work_times_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_division_id_name_key" UNIQUE ("division_id", "name");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_times"
    ADD CONSTRAINT "work_times_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_times"
    ADD CONSTRAINT "work_times_profile_date_unique" UNIQUE ("user_id", "date");



CREATE INDEX "idx_profiles_division_id" ON "public"."profiles" USING "btree" ("division_id");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_tasks_user_id_status_progress" ON "public"."tasks" USING "btree" ("user_id", "status", "timestamp_progress");



CREATE INDEX "idx_work_times_user_id_date" ON "public"."work_times" USING "btree" ("user_id", "date");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigner_id_fkey" FOREIGN KEY ("assigner_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."work_times"
    ADD CONSTRAINT "work_times_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



CREATE POLICY "Public users can view all divisions" ON "public"."divisions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public users can view all roles" ON "public"."roles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can delete their own tasks" ON "public"."tasks" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert activities in their division" ON "public"."activities" FOR INSERT TO "authenticated" WITH CHECK (("division_id" = ( SELECT "public"."get_my_division_id"() AS "get_my_division_id")));



CREATE POLICY "Users can insert tasks" ON "public"."tasks" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can insert their own work times" ON "public"."work_times" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own tasks" ON "public"."tasks" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own work times" ON "public"."work_times" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view activities in their division" ON "public"."activities" FOR SELECT TO "authenticated" USING (("division_id" = ( SELECT "public"."get_my_division_id"() AS "get_my_division_id")));



CREATE POLICY "Users can view all profiles from same division" ON "public"."profiles" FOR SELECT TO "authenticated" USING (((( SELECT "public"."get_my_division_id"() AS "get_my_division_id") IS NOT NULL) AND ("division_id" = ( SELECT "public"."get_my_division_id"() AS "get_my_division_id"))));



CREATE POLICY "Users can view all tasks from same division" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."division_id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "tasks"."user_id")) = ( SELECT "public"."get_my_division_id"() AS "get_my_division_id")));



CREATE POLICY "Users can view all work times from same division" ON "public"."work_times" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."division_id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "work_times"."user_id")) = ( SELECT "public"."get_my_division_id"() AS "get_my_division_id")));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own tasks" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own work times" ON "public"."work_times" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."divisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_times" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































REVOKE ALL ON FUNCTION "public"."_dashboard_get_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dashboard_get_comparison"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dashboard_get_fte"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_pie_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_pie_chart"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_stats"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_stats"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_table"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_table"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dashboard_get_time_metrics"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dashboard_period_summary"("p_division_id" bigint, "p_from" "date", "p_to" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_overview"("p_from_date" "date", "p_to_date" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_overview"("p_from_date" "date", "p_to_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_overview"("p_from_date" "date", "p_to_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_division_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_division_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_division_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."task_effective_minute"("p_status" "public"."task_status", "p_timestamp_progress" timestamp with time zone, "p_pause_time" timestamp with time zone, "p_minute_pause" bigint, "p_minute_activity" bigint) TO "service_role";


















GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."divisions" TO "anon";
GRANT ALL ON TABLE "public"."divisions" TO "authenticated";
GRANT ALL ON TABLE "public"."divisions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."divisions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."divisions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."divisions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tasks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tasks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tasks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."work_times" TO "anon";
GRANT ALL ON TABLE "public"."work_times" TO "authenticated";
GRANT ALL ON TABLE "public"."work_times" TO "service_role";



GRANT ALL ON SEQUENCE "public"."work_times_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."work_times_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."work_times_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































