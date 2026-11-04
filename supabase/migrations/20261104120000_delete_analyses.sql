create policy analyses_delete on public.analyses
  for delete to authenticated
  using (owner_id = (select auth.uid()));

grant delete on public.analyses to authenticated;
