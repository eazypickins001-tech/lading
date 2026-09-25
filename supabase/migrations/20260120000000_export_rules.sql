insert into public.requirement_rules
  (hs_prefix, origin_country, destination_country, channel, doc_type, authority, condition, notes, source_url)
values
  ('', 'NG', null, 'export', 'nepc_certificate', 'Nigerian Export Promotion Council', '{"all_exports":true}', 'Exporters must register with NEPC before exporting.', 'https://nepc.gov.ng/'),
  ('', 'NG', null, 'export', 'certificate_of_origin', 'NACCIMA / NEPC', '{"preferential_treatment":true}', 'Certificate of origin is needed to claim preferential tariff treatment.', 'https://naccima.com/'),
  ('', 'NG', null, 'export', 'phytosanitary', 'NAQS', '{"plant_products":true}', 'Phytosanitary certificate is required for plants and plant products.', null)
on conflict do nothing;
