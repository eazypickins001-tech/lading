create table public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null unique,
  paystack_plan_code text not null,
  amount_ngn numeric not null,
  interval text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_plans enable row level security;

create policy payment_plans_select_authenticated on public.payment_plans
  for select using (auth.uid() is not null);

create trigger set_updated_at_payment_plans before update on public.payment_plans
  for each row execute function public.set_updated_at();
