create extension if not exists "pgcrypto";

create type public.org_type as enum ('trader', 'agent', 'both');
create type public.member_role as enum ('owner', 'admin', 'trader', 'agent', 'viewer');
create type public.party_type as enum ('exporter', 'consignee', 'notify', 'agent', 'bank', 'carrier');
create type public.trade_channel as enum ('import', 'export');
create type public.transport_mode as enum ('sea', 'air', 'road', 'rail', 'courier', 'multimodal');
create type public.shipment_status as enum ('draft', 'documents_pending', 'ready', 'submitted', 'cleared', 'closed', 'cancelled');
create type public.doc_type as enum (
  'commercial_invoice', 'packing_list', 'proforma_invoice', 'certificate_of_origin',
  'bill_of_lading', 'airway_bill', 'form_m', 'paar', 'soncap', 'nafdac_permit',
  'nepc_certificate', 'phytosanitary', 'insurance_certificate', 'other'
);
create type public.finding_severity as enum ('info', 'warning', 'error', 'critical');
create type public.subscription_plan as enum ('free', 'starter', 'professional', 'organization', 'agent');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'expired');
create type public.source_access_method as enum ('api', 'download', 'scrape', 'manual');
create type public.source_status as enum ('ok', 'degraded', 'broken');
create type public.staged_change_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  country text not null default 'NG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.org_type not null default 'trader',
  country text not null default 'NG',
  plan public.subscription_plan not null default 'free',
  trial_ends_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'trader',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_user_idx on public.memberships (user_id);

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  type public.party_type not null,
  name text not null,
  address text,
  country text,
  contact_name text,
  contact_email text,
  contact_phone text,
  tax_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parties_org_idx on public.parties (org_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  description text not null,
  hs_code text,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_org_idx on public.products (org_id);
create index products_hs_idx on public.products (hs_code);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  reference text,
  channel public.trade_channel not null default 'import',
  origin_country text not null,
  destination_country text not null,
  mode public.transport_mode not null default 'sea',
  incoterm text,
  incoterm_place text,
  currency text not null default 'NGN',
  status public.shipment_status not null default 'draft',
  exporter_party_id uuid references public.parties (id),
  consignee_party_id uuid references public.parties (id),
  agent_org_id uuid references public.organizations (id),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipments_org_idx on public.shipments (org_id);
create index shipments_status_idx on public.shipments (status);

create table public.shipment_access (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  unique (shipment_id, org_id)
);

create table public.shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  product_id uuid references public.products (id),
  description text not null,
  hs_code text,
  quantity numeric(14, 3) not null default 1,
  unit text not null default 'unit',
  unit_value numeric(16, 4) not null default 0,
  currency text not null default 'NGN',
  net_weight_kg numeric(14, 3),
  gross_weight_kg numeric(14, 3),
  created_at timestamptz not null default now()
);

create index shipment_items_shipment_idx on public.shipment_items (shipment_id);

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  doc_type public.doc_type not null,
  country_scope text,
  name text not null,
  version integer not null default 1,
  mapping jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipment_documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  doc_type public.doc_type not null,
  template_id uuid references public.document_templates (id),
  file_url text,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  generated_by uuid references auth.users (id),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipment_documents_shipment_idx on public.shipment_documents (shipment_id);

create table public.hs_codes (
  code text primary key,
  description text not null,
  level integer not null,
  parent text,
  source text
);

create table public.tariffs (
  id uuid primary key default gen_random_uuid(),
  hs_code text not null,
  country text not null,
  duty_rate numeric(7, 3),
  vat_rate numeric(7, 3),
  levies jsonb not null default '{}'::jsonb,
  currency text,
  effective_from date,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (hs_code, country, effective_from)
);

create index tariffs_hs_country_idx on public.tariffs (hs_code, country);

create table public.incoterms (
  code text primary key,
  name text not null,
  mode_scope text[] not null default '{}',
  obligations jsonb not null default '{}'::jsonb
);

create table public.requirement_rules (
  id uuid primary key default gen_random_uuid(),
  hs_prefix text not null,
  origin_country text,
  destination_country text,
  channel public.trade_channel not null,
  doc_type public.doc_type not null,
  authority text,
  condition jsonb not null default '{}'::jsonb,
  notes text,
  source_url text,
  effective_from date,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index requirement_rules_lookup_idx
  on public.requirement_rules (hs_prefix, channel, destination_country);

create table public.consistency_findings (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  severity public.finding_severity not null default 'warning',
  field text,
  docs_involved text[] not null default '{}',
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index consistency_findings_shipment_idx on public.consistency_findings (shipment_id);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'active',
  provider text,
  provider_ref text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_org_idx on public.subscriptions (org_id);

create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  period_start date not null,
  docs_created integer not null default 0,
  shipments_created integer not null default 0,
  unique (org_id, period_start)
);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  base_url text not null,
  access_method public.source_access_method not null default 'download',
  cadence text not null default 'weekly',
  parser_key text,
  etag text,
  content_hash text,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  status public.source_status not null default 'ok',
  review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources (id) on delete cascade,
  fetched_at timestamptz not null default now(),
  content_hash text,
  raw_ref text,
  diff_summary text
);

create index source_snapshots_source_idx on public.source_snapshots (source_id, fetched_at desc);

create table public.staged_changes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources (id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  old_value jsonb,
  new_value jsonb,
  detected_at timestamptz not null default now(),
  status public.staged_change_status not null default 'pending',
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz
);

create index staged_changes_status_idx on public.staged_changes (status, detected_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at_organizations before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger set_updated_at_parties before update on public.parties
  for each row execute function public.set_updated_at();
create trigger set_updated_at_products before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at_shipments before update on public.shipments
  for each row execute function public.set_updated_at();
create trigger set_updated_at_document_templates before update on public.document_templates
  for each row execute function public.set_updated_at();
create trigger set_updated_at_shipment_documents before update on public.shipment_documents
  for each row execute function public.set_updated_at();
create trigger set_updated_at_subscriptions before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger set_updated_at_data_sources before update on public.data_sources
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = target_org and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(target_org uuid, roles public.member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = target_org and user_id = auth.uid() and role = any (roles)
  );
$$;

create or replace function public.can_access_shipment(target_shipment uuid)
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
      and (
        public.is_org_member(s.org_id)
        or exists (
          select 1 from public.shipment_access sa
          where sa.shipment_id = s.id and public.is_org_member(sa.org_id)
        )
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.parties enable row level security;
alter table public.products enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_access enable row level security;
alter table public.shipment_items enable row level security;
alter table public.document_templates enable row level security;
alter table public.shipment_documents enable row level security;
alter table public.hs_codes enable row level security;
alter table public.tariffs enable row level security;
alter table public.incoterms enable row level security;
alter table public.requirement_rules enable row level security;
alter table public.consistency_findings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_counters enable row level security;
alter table public.data_sources enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.staged_changes enable row level security;

create policy profiles_select_self_or_coworker on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships me
      join public.memberships them on them.org_id = me.org_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

create policy organizations_select_member on public.organizations
  for select using (public.is_org_member(id));

create policy organizations_insert_authenticated on public.organizations
  for insert with check (auth.uid() is not null);

create policy organizations_update_admin on public.organizations
  for update using (public.has_org_role(id, array['owner','admin']::public.member_role[]));

create policy memberships_select_member on public.memberships
  for select using (public.is_org_member(org_id));

create policy memberships_insert_admin on public.memberships
  for insert with check (public.has_org_role(org_id, array['owner','admin']::public.member_role[]) or user_id = auth.uid());

create policy memberships_update_admin on public.memberships
  for update using (public.has_org_role(org_id, array['owner','admin']::public.member_role[]));

create policy memberships_delete_admin on public.memberships
  for delete using (public.has_org_role(org_id, array['owner','admin']::public.member_role[]));

create policy parties_member_all on public.parties
  for all using (public.is_org_member(org_id))
  with check (public.has_org_role(org_id, array['owner','admin','trader','agent']::public.member_role[]));

create policy products_member_all on public.products
  for all using (public.is_org_member(org_id))
  with check (public.has_org_role(org_id, array['owner','admin','trader','agent']::public.member_role[]));

create policy shipments_select on public.shipments
  for select using (public.can_access_shipment(id));

create policy shipments_insert on public.shipments
  for insert with check (public.has_org_role(org_id, array['owner','admin','trader','agent']::public.member_role[]));

create policy shipments_update on public.shipments
  for update using (public.can_access_shipment(id));

create policy shipments_delete on public.shipments
  for delete using (public.has_org_role(org_id, array['owner','admin']::public.member_role[]));

create policy shipment_access_select on public.shipment_access
  for select using (public.is_org_member(org_id));

create policy shipment_access_manage on public.shipment_access
  for all using (public.has_org_role(org_id, array['owner','admin','trader']::public.member_role[]))
  with check (public.has_org_role(org_id, array['owner','admin','trader']::public.member_role[]));

create policy shipment_items_access on public.shipment_items
  for all using (public.can_access_shipment(shipment_id))
  with check (public.can_access_shipment(shipment_id));

create policy shipment_documents_access on public.shipment_documents
  for all using (public.can_access_shipment(shipment_id))
  with check (public.can_access_shipment(shipment_id));

create policy consistency_findings_access on public.consistency_findings
  for all using (public.can_access_shipment(shipment_id))
  with check (public.can_access_shipment(shipment_id));

create policy subscriptions_select_member on public.subscriptions
  for select using (public.is_org_member(org_id));

create policy subscriptions_manage_admin on public.subscriptions
  for all using (public.has_org_role(org_id, array['owner','admin']::public.member_role[]))
  with check (public.has_org_role(org_id, array['owner','admin']::public.member_role[]));

create policy usage_counters_select_member on public.usage_counters
  for select using (public.is_org_member(org_id));

create policy document_templates_read on public.document_templates
  for select using (auth.uid() is not null);

create policy hs_codes_read on public.hs_codes
  for select using (auth.uid() is not null);

create policy tariffs_read on public.tariffs
  for select using (auth.uid() is not null);

create policy incoterms_read on public.incoterms
  for select using (auth.uid() is not null);

create policy requirement_rules_read on public.requirement_rules
  for select using (auth.uid() is not null);

create policy data_sources_read on public.data_sources
  for select using (auth.uid() is not null);

create policy source_snapshots_read on public.source_snapshots
  for select using (auth.uid() is not null);

create policy staged_changes_read on public.staged_changes
  for select using (auth.uid() is not null);

grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public grant select on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
