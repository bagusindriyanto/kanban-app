alter table public.activities
  add column division_id integer;

update public.activities
set division_id = 2
where division_id is null;

alter table public.activities
  alter column division_id set not null,
  add constraint activities_division_id_fkey
    foreign key (division_id) references public.divisions (id),
  drop constraint activities_name_key,
  add constraint activities_division_id_name_key unique (division_id, name);

drop policy "Users can view all activities" on public.activities;
drop policy "Users can insert an activity" on public.activities;

create policy "Users can view activities in their division"
on public.activities
for select
to authenticated
using (division_id = (select public.get_my_division_id()));

create policy "Users can insert activities in their division"
on public.activities
for insert
to authenticated
with check (division_id = (select public.get_my_division_id()));
