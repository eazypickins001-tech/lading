insert into public.requirement_rules
  (hs_prefix, origin_country, destination_country, channel, doc_type, authority, condition, notes, source_url)
values
  ('', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{"food_products":true}', 'FDA Prior Notice is required for food and agricultural products entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('08', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{}', 'FDA Prior Notice is required for edible fruit and nuts entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('09', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{}', 'FDA Prior Notice is required for coffee, tea and spices entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('12', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{}', 'FDA Prior Notice is required for oil seeds and oleaginous fruits entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('18', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{}', 'FDA Prior Notice is required for cocoa and cocoa preparations entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('20', 'NG', 'US', 'export', 'fda_notification', 'US FDA', '{}', 'FDA Prior Notice is required for preparations of vegetables, fruit and nuts entering the United States.', 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods'),
  ('08', 'NG', 'US', 'export', 'phytosanitary', 'NAQS', '{}', 'Phytosanitary certificate is required for plant products exported from Nigeria.', null),
  ('12', 'NG', 'US', 'export', 'phytosanitary', 'NAQS', '{}', 'Phytosanitary certificate is required for plant products exported from Nigeria.', null),
  ('18', 'NG', 'US', 'export', 'phytosanitary', 'NAQS', '{}', 'Phytosanitary certificate is required for plant products exported from Nigeria.', null)
on conflict do nothing;
