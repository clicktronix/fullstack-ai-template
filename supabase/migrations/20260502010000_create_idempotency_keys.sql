create table if not exists public.idempotency_keys (
  key text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  method text not null,
  path text not null,
  request_hash text not null,
  status_code integer null,
  response_body jsonb null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  primary key (key, user_id, method, path)
);

create index if not exists idempotency_keys_expires_at_idx
  on public.idempotency_keys (expires_at);

alter table public.idempotency_keys enable row level security;

drop policy if exists idempotency_keys_self_select on public.idempotency_keys;
create policy idempotency_keys_self_select on public.idempotency_keys
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists idempotency_keys_self_insert on public.idempotency_keys;
create policy idempotency_keys_self_insert on public.idempotency_keys
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists idempotency_keys_self_update on public.idempotency_keys;
create policy idempotency_keys_self_update on public.idempotency_keys
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists idempotency_keys_self_delete on public.idempotency_keys;
create policy idempotency_keys_self_delete on public.idempotency_keys
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.idempotency_keys is 'Stores service API command responses for safe idempotent retries';
