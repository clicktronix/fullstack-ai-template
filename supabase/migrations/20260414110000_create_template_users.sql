create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'pending' check (role in ('owner', 'admin', 'pending')),
  full_name text null,
  created_at timestamptz null default now(),
  updated_at timestamptz null default now()
);

alter table public.users enable row level security;

create or replace function public.get_user_role(user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where id = user_id
$$;

-- Authenticated users can read their own row. Owners can also read every user
-- (including email) so the baseline template can power admin/team views without
-- a service-role bypass. If the product requires per-tenant or column-level
-- isolation, replace the owner branch with a tenant_id check or move admin
-- listings to a service-role data path.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or public.get_user_role((select auth.uid())) = 'owner'
  );

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and role = (select u.role from public.users as u where u.id = (select auth.uid()))
    and email = (select u.email from public.users as u where u.id = (select auth.uid()))
    and created_at is not distinct from (select u.created_at from public.users as u where u.id = (select auth.uid()))
  );

comment on table public.users is 'Application users for the starter template';
comment on function public.get_user_role(uuid) is 'Returns the application role for the given user';
