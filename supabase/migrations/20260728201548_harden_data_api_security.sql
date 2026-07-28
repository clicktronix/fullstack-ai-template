-- Security ownership: identity owns users and auth helpers; labels/work-items own
-- their tables; shared/server owns idempotency_keys.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.users
  where id = (select auth.uid())
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to authenticated;
comment on function private.current_user_role() is
  'Returns the current authenticated application role for RLS policies';

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role text;
begin
  perform pg_advisory_xact_lock(hashtext('private.handle_new_auth_user'));

  assigned_role :=
    case
      when exists (select 1 from public.users) then 'pending'
      else 'owner'
    end;

  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_auth_user();

drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (select private.current_user_role()) = 'owner'
  );

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists labels_admin_select on public.labels;
create policy labels_admin_select on public.labels
  for select
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists labels_admin_insert on public.labels;
create policy labels_admin_insert on public.labels
  for insert
  to authenticated
  with check ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists labels_admin_update on public.labels;
create policy labels_admin_update on public.labels
  for update
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'))
  with check ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists labels_admin_delete on public.labels;
create policy labels_admin_delete on public.labels
  for delete
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists work_items_admin_select on public.work_items;
create policy work_items_admin_select on public.work_items
  for select
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists work_items_admin_insert on public.work_items;
create policy work_items_admin_insert on public.work_items
  for insert
  to authenticated
  with check ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists work_items_admin_update on public.work_items;
create policy work_items_admin_update on public.work_items
  for update
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'))
  with check ((select private.current_user_role()) in ('owner', 'admin'));

drop policy if exists work_items_admin_delete on public.work_items;
create policy work_items_admin_delete on public.work_items
  for delete
  to authenticated
  using ((select private.current_user_role()) in ('owner', 'admin'));

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select on table public.users to authenticated;
grant update (full_name, updated_at) on table public.users to authenticated;
grant select, insert, update, delete on table public.labels to authenticated;
grant select, insert, update, delete on table public.work_items to authenticated;
grant select, insert, update, delete on table public.idempotency_keys to authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated;

drop function if exists public.get_user_role(uuid);
drop function if exists public.handle_new_auth_user();
