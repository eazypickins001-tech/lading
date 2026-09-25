create extension if not exists pg_trgm;

create table public.screening_entries (
  id uuid primary key default gen_random_uuid(),
  source text,
  name text not null,
  name_normalized text not null,
  entity_type text,
  country text,
  program text,
  aliases text[],
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (source, name_normalized)
);

create index screening_entries_name_trgm_idx on public.screening_entries
  using gin (name_normalized gin_trgm_ops);

alter table public.screening_entries enable row level security;

create policy screening_entries_read on public.screening_entries
  for select using (auth.uid() is not null);

create or replace function public.normalize_name(p_name text)
returns text
language sql
immutable
as $$
  select btrim(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function public.screen_name(p_name text, p_limit integer default 10)
returns table (
  id uuid,
  name text,
  source text,
  entity_type text,
  country text,
  score real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.name,
    e.source,
    e.entity_type,
    e.country,
    similarity(e.name_normalized, public.normalize_name(p_name)) as score
  from public.screening_entries e
  where similarity(e.name_normalized, public.normalize_name(p_name)) > 0.35
  order by score desc
  limit p_limit;
$$;

grant execute on function public.screen_name(text, integer) to authenticated;

create table public.screening_results (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  party_type text,
  party_name text,
  matched_name text,
  source text,
  score real,
  created_at timestamptz not null default now()
);

create index screening_results_org_idx on public.screening_results (org_id);
create index screening_results_shipment_idx on public.screening_results (shipment_id);

alter table public.screening_results enable row level security;

create policy screening_results_select_member on public.screening_results
  for select using (public.is_org_member(org_id));

create policy screening_results_insert_member on public.screening_results
  for insert with check (public.is_org_member(org_id));

insert into public.data_sources (name, category, base_url, access_method, cadence, parser_key)
select 'US Consolidated Screening List', 'screening', 'https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.csv', 'download', 'weekly', 'us_csl'
where not exists (
  select 1 from public.data_sources where name = 'US Consolidated Screening List'
);
