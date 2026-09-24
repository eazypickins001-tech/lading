alter table public.consistency_findings
  add column if not exists code text;
