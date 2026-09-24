create table public.fx_rates (
  id uuid primary key default gen_random_uuid(),
  currency text not null,
  rate_ngn numeric not null,
  source_url text,
  effective_date date not null default current_date,
  retrieved_at timestamptz not null default now(),
  unique (currency, effective_date)
);

create index fx_rates_currency_date_idx
  on public.fx_rates (currency, effective_date desc);

alter table public.fx_rates enable row level security;

create policy fx_rates_select_authenticated on public.fx_rates
  for select using (auth.uid() is not null);
