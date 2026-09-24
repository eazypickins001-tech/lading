create unique index if not exists subscriptions_one_active_per_org
  on public.subscriptions (org_id)
  where status = 'active';
