create or replace function public.increment_usage(p_org uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_org_member(p_org) then
    raise exception 'Caller is not a member of organization %', p_org;
  end if;

  if p_kind not in ('document', 'shipment') then
    raise exception 'Unsupported usage kind: %', p_kind;
  end if;

  insert into public.usage_counters (org_id, period_start, docs_created, shipments_created)
  values (
    p_org,
    date_trunc('month', now())::date,
    case when p_kind = 'document' then 1 else 0 end,
    case when p_kind = 'shipment' then 1 else 0 end
  )
  on conflict (org_id, period_start) do update
    set docs_created = public.usage_counters.docs_created
        + case when p_kind = 'document' then 1 else 0 end,
        shipments_created = public.usage_counters.shipments_created
        + case when p_kind = 'shipment' then 1 else 0 end;
end;
$$;

grant execute on function public.increment_usage(uuid, text) to authenticated;
