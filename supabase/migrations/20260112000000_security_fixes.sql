create or replace function public.owns_shipment(target_shipment uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shipments s
    where s.id = target_shipment
      and public.has_org_role(s.org_id, array['owner','admin','trader']::public.member_role[])
  );
$$;

drop policy if exists shipment_access_manage on public.shipment_access;

create policy shipment_access_manage on public.shipment_access
  for all
  using (public.owns_shipment(shipment_id))
  with check (public.owns_shipment(shipment_id));

create table if not exists public.platform_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

insert into public.platform_admins (email)
values ('geraldnoria@gmail.com'), ('eazypickins001@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where lower(pa.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists data_sources_read on public.data_sources;
create policy data_sources_read on public.data_sources
  for select using (public.is_platform_admin());

drop policy if exists source_snapshots_read on public.source_snapshots;
create policy source_snapshots_read on public.source_snapshots
  for select using (public.is_platform_admin());

drop policy if exists staged_changes_read on public.staged_changes;
create policy staged_changes_read on public.staged_changes
  for select using (public.is_platform_admin());

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_org_idx
  on public.audit_events (org_id, created_at desc);

alter table public.audit_events enable row level security;

create policy audit_events_select_member on public.audit_events
  for select using (org_id is not null and public.is_org_member(org_id));

create policy audit_events_insert_member on public.audit_events
  for insert with check (public.is_org_member(org_id) and user_id = auth.uid());

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
