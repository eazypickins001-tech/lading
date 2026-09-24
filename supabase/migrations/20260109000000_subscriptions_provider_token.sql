alter table public.subscriptions
  add column if not exists provider_token text;
