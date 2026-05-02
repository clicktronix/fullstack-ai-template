-- Allow owners and admins to hard-delete demo entities.
-- The template's server actions only expose archive/restore; this policy keeps
-- the door open for admin tooling that needs physical deletion (e.g. GDPR
-- erasure flows) without falling back to the service role.

drop policy if exists labels_admin_delete on public.labels;
create policy labels_admin_delete on public.labels
  for delete
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'));

drop policy if exists work_items_admin_delete on public.work_items;
create policy work_items_admin_delete on public.work_items
  for delete
  to authenticated
  using (public.get_user_role((select auth.uid())) in ('owner', 'admin'));
