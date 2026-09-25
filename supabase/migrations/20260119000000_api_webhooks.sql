create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  last_used_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists api_keys_org_idx
  on public.api_keys (org_id, created_at desc);

create index if not exists api_keys_hash_idx
  on public.api_keys (key_hash);

alter table public.api_keys enable row level security;

create policy api_keys_select_member on public.api_keys
  for select using (public.is_org_member(org_id));

create policy api_keys_insert_member on public.api_keys
  for insert with check (public.is_org_member(org_id));

create policy api_keys_update_member on public.api_keys
  for update using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  url text not null,
  secret text not null,
  events text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists webhook_endpoints_org_idx
  on public.webhook_endpoints (org_id, created_at desc);

alter table public.webhook_endpoints enable row level security;

create policy webhook_endpoints_member_all on public.webhook_endpoints
  for all using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references public.webhook_endpoints (id) on delete cascade,
  event text not null,
  status_code integer,
  ok boolean,
  created_at timestamptz not null default now()
);

create index if not exists webhook_deliveries_endpoint_idx
  on public.webhook_deliveries (endpoint_id, created_at desc);

alter table public.webhook_deliveries enable row level security;

create policy webhook_deliveries_select_member on public.webhook_deliveries
  for select using (
    exists (
      select 1
      from public.webhook_endpoints e
      where e.id = endpoint_id and public.is_org_member(e.org_id)
    )
  );

grant select, insert, update on public.api_keys to authenticated;
grant select, insert, update, delete on public.webhook_endpoints to authenticated;
grant select on public.webhook_deliveries to authenticated;

grant all on public.api_keys to service_role;
grant all on public.webhook_endpoints to service_role;
grant all on public.webhook_deliveries to service_role;
