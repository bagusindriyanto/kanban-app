-- Dashboard: time-based metrics + period comparison
-- Run this in the Supabase SQL editor (or via CLI) for project ccsxmqljqhgvdxwfbaxg.

-- 1) Per-user / division time metrics for done tasks in the selected period
create or replace function public._dashboard_get_time_metrics(
  p_division_id bigint,
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
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
$function$;

-- 2) Period-based summary used by the comparison
create or replace function public._dashboard_period_summary(
  p_division_id bigint,
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
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
$function$;

-- 3) Period-over-period comparison with % deltas
create or replace function public._dashboard_get_comparison(
  p_division_id bigint,
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
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
$function$;

-- 4) Extend get_dashboard_overview with the new sections
create or replace function public.get_dashboard_overview(p_from_date date default null::date, p_to_date date default null::date)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
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
    'comparison', public._dashboard_get_comparison(v_division_id, v_from, v_to)
  );
end;$function$
;

-- 5) Revoke direct EXECUTE so anon/authenticated can only reach these
--    through the SECURITY DEFINER get_dashboard_overview
revoke execute on function public._dashboard_get_time_metrics(bigint, date, date) from public;
revoke execute on function public._dashboard_period_summary(bigint, date, date) from public;
revoke execute on function public._dashboard_get_comparison(bigint, date, date) from public;