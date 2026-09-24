drop policy if exists shipments_select on public.shipments;

create policy shipments_select_member on public.shipments
  for select using (public.is_org_member(org_id));

create policy shipments_select_agent on public.shipments
  for select using (
    exists (
      select 1
      from public.shipment_access sa
      where sa.shipment_id = shipments.id
        and public.is_org_member(sa.org_id)
    )
  );
