create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text null,
  created_at timestamptz not null default now()
);

create table if not exists public.work_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  status text not null default 'active' check (status in ('active', 'archived')),
  is_priority boolean not null default false,
  label_ids uuid[] not null default '{}',
  created_by uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists labels_name_idx on public.labels (name);
create index if not exists work_items_status_updated_at_idx on public.work_items (status, updated_at desc);
create index if not exists work_items_priority_idx on public.work_items (is_priority) where is_priority = true;
create index if not exists work_items_title_search_idx on public.work_items using gin (to_tsvector('simple', title));
create index if not exists work_items_description_search_idx
  on public.work_items using gin (to_tsvector('simple', coalesce(description, '')));
create index if not exists work_items_label_ids_idx on public.work_items using gin (label_ids);

alter table public.labels enable row level security;
alter table public.work_items enable row level security;

drop policy if exists labels_admin_select on public.labels;
create policy labels_admin_select on public.labels
  for select
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists labels_admin_insert on public.labels;
create policy labels_admin_insert on public.labels
  for insert
  to authenticated
  with check (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists labels_admin_update on public.labels;
create policy labels_admin_update on public.labels
  for update
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'))
  with check (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists work_items_admin_select on public.work_items;
create policy work_items_admin_select on public.work_items
  for select
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists work_items_admin_insert on public.work_items;
create policy work_items_admin_insert on public.work_items
  for insert
  to authenticated
  with check (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists work_items_admin_update on public.work_items;
create policy work_items_admin_update on public.work_items
  for update
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'))
  with check (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

comment on table public.labels is 'Reference labels for the template work items slice';
comment on table public.work_items is 'Demo entity for the template vertical slice';
