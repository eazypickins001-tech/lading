create policy organizations_select_creator on public.organizations
  for select using (created_by = auth.uid());
