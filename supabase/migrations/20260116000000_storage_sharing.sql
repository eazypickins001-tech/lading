alter table public.organizations
  add column if not exists logo_url text,
  add column if not exists signature_url text,
  add column if not exists seal_url text;

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid references auth.users (id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists share_links_shipment_idx
  on public.share_links (shipment_id, created_at desc);

alter table public.share_links enable row level security;

drop policy if exists share_links_select_member on public.share_links;
create policy share_links_select_member on public.share_links
  for select using (public.is_org_member(org_id));

drop policy if exists share_links_insert_member on public.share_links;
create policy share_links_insert_member on public.share_links
  for insert with check (public.is_org_member(org_id));

drop policy if exists share_links_delete_member on public.share_links;
create policy share_links_delete_member on public.share_links
  for delete using (public.is_org_member(org_id));

grant select, insert, delete on public.share_links to authenticated;
grant all on public.share_links to service_role;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists documents_select_member on storage.objects;
create policy documents_select_member on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists documents_insert_member on storage.objects;
create policy documents_insert_member on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists documents_delete_member on storage.objects;
create policy documents_delete_member on storage.objects
  for delete using (
    bucket_id = 'documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists branding_public_select on storage.objects;
create policy branding_public_select on storage.objects
  for select using (bucket_id = 'branding');

drop policy if exists branding_insert_member on storage.objects;
create policy branding_insert_member on storage.objects
  for insert with check (
    bucket_id = 'branding'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );
