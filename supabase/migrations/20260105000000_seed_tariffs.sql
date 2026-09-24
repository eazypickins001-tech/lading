insert into public.tariffs
  (hs_code, country, duty_rate, vat_rate, levies, currency, effective_from, source_url)
values
  ('847130', 'NG', 0, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('852852', 'NG', 10, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('610910', 'NG', 20, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('300490', 'NG', 20, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('870323', 'NG', 35, 7.5, '{"nac":5}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('100630', 'NG', 10, 7.5, '{"levy":60}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('271019', 'NG', 10, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('310210', 'NG', 5, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('080131', 'NG', 20, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/'),
  ('120740', 'NG', 20, 7.5, '{}'::jsonb, 'NGN', '2025-01-01', 'https://customs.gov.ng/')
on conflict (hs_code, country, effective_from) do nothing;
