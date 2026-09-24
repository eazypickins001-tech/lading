alter table public.shipments
  add column if not exists notify_party_id uuid references public.parties (id) on delete set null;

create index if not exists shipments_notify_party_idx on public.shipments (notify_party_id);
