insert into public.incoterms (code, name, mode_scope, obligations) values
  ('EXW', 'Ex Works', array['any'], '{"risk_transfer":"seller_premises","export_clearance":"buyer","main_carriage":"buyer","import_clearance":"buyer","insurance":"none"}'),
  ('FCA', 'Free Carrier', array['any'], '{"risk_transfer":"named_place","export_clearance":"seller","main_carriage":"buyer","import_clearance":"buyer","insurance":"none"}'),
  ('CPT', 'Carriage Paid To', array['any'], '{"risk_transfer":"first_carrier","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"none"}'),
  ('CIP', 'Carriage and Insurance Paid To', array['any'], '{"risk_transfer":"first_carrier","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"seller_required"}'),
  ('DAP', 'Delivered At Place', array['any'], '{"risk_transfer":"destination_ready_for_unloading","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"none"}'),
  ('DPU', 'Delivered at Place Unloaded', array['any'], '{"risk_transfer":"destination_unloaded","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"none"}'),
  ('DDP', 'Delivered Duty Paid', array['any'], '{"risk_transfer":"destination_import_cleared","export_clearance":"seller","main_carriage":"seller","import_clearance":"seller","insurance":"none"}'),
  ('FAS', 'Free Alongside Ship', array['sea','inland_waterway'], '{"risk_transfer":"alongside_vessel","export_clearance":"seller","main_carriage":"buyer","import_clearance":"buyer","insurance":"none"}'),
  ('FOB', 'Free On Board', array['sea','inland_waterway'], '{"risk_transfer":"on_board_vessel","export_clearance":"seller","main_carriage":"buyer","import_clearance":"buyer","insurance":"none"}'),
  ('CFR', 'Cost and Freight', array['sea','inland_waterway'], '{"risk_transfer":"on_board_vessel","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"none"}'),
  ('CIF', 'Cost, Insurance and Freight', array['sea','inland_waterway'], '{"risk_transfer":"on_board_vessel","export_clearance":"seller","main_carriage":"seller","import_clearance":"buyer","insurance":"seller_required"}')
on conflict (code) do nothing;

insert into public.data_sources (name, category, base_url, access_method, cadence, parser_key) values
  ('NCS CET Lookup Portal', 'tariff', 'https://demo-cet.customs.gov.ng/', 'scrape', 'weekly', 'ncs_cet'),
  ('Nigerian Trade Information Portal (NTIP)', 'tariff', 'https://tip.nsw.gov.ng/trade-information/commodity-and-tariff', 'download', 'weekly', 'ntip_cet'),
  ('Nigeria Trade Portal (Single Window)', 'procedures', 'https://trade.gov.ng/en', 'scrape', 'weekly', 'ng_trade_portal'),
  ('FMITI Trade Information Portal', 'procedures', 'https://nigeriainfotrade.fmiti.gov.ng/', 'scrape', 'weekly', 'fmiti_eregulations'),
  ('WTO Tariff & Trade Data', 'tariff', 'https://ttd.wto.org/', 'download', 'weekly', 'wto_ttd'),
  ('US Consolidated Screening List', 'screening', 'https://api.trade.gov/', 'api', 'daily', 'us_csl'),
  ('UN Security Council Sanctions List', 'screening', 'https://www.un.org/securitycouncil/content/un-sc-consolidated-list', 'download', 'daily', 'un_sanctions'),
  ('EU Consolidated Sanctions List', 'screening', 'https://finance.ec.europa.eu/', 'download', 'daily', 'eu_sanctions'),
  ('NCS Customs Exchange Rate', 'fx', 'https://customs.gov.ng/exchange-rate', 'scrape', 'daily', 'ncs_fx'),
  ('CBN Exchange Rate', 'fx', 'https://www.cbn.gov.ng/rates/', 'scrape', 'daily', 'cbn_fx'),
  ('NAFDAC e-License', 'permits', 'https://www.nafdac.gov.ng/', 'scrape', 'weekly', 'nafdac'),
  ('SON SONCAP', 'permits', 'https://son.gov.ng/', 'scrape', 'weekly', 'soncap'),
  ('Nigerian Export Promotion Council', 'permits', 'https://nepc.gov.ng/', 'scrape', 'weekly', 'nepc'),
  ('NACCIMA Certificate of Origin', 'permits', 'https://naccima.com/', 'manual', 'weekly', 'naccima')
on conflict do nothing;

insert into public.hs_codes (code, description, level, parent, source) values
  ('1801', 'Cocoa beans, whole or broken, raw or roasted', 4, '18', 'WCO HS 2022'),
  ('180100', 'Cocoa beans, whole or broken, raw or roasted', 6, '1801', 'WCO HS 2022'),
  ('0902', 'Tea, whether or not flavoured', 4, '09', 'WCO HS 2022'),
  ('1207', 'Other oil seeds and oleaginous fruits', 4, '12', 'WCO HS 2022'),
  ('120740', 'Sesamum seeds, whether or not broken', 6, '1207', 'WCO HS 2022'),
  ('0801', 'Coconuts, Brazil nuts and cashew nuts', 4, '08', 'WCO HS 2022'),
  ('080131', 'Cashew nuts, in shell, fresh or dried', 6, '0801', 'WCO HS 2022'),
  ('3102', 'Mineral or chemical fertilisers, nitrogenous', 4, '31', 'WCO HS 2022'),
  ('310210', 'Urea, whether or not in aqueous solution', 6, '3102', 'WCO HS 2022'),
  ('2709', 'Petroleum oils and oils from bituminous minerals, crude', 4, '27', 'WCO HS 2022'),
  ('270900', 'Petroleum oils and oils from bituminous minerals, crude', 6, '2709', 'WCO HS 2022')
on conflict (code) do nothing;

insert into public.requirement_rules
  (hs_prefix, origin_country, destination_country, channel, doc_type, authority, condition, notes, source_url)
values
  ('', null, 'NG', 'import', 'form_m', 'CBN / Authorised Dealer Bank', '{"all_imports":true}', 'Form M must be registered before shipment for all commercial imports.', 'https://trade.gov.ng/en'),
  ('', null, 'NG', 'import', 'paar', 'Nigeria Customs Service', '{"all_imports":true}', 'Pre-Arrival Assessment Report is required for duty assessment.', 'https://customs.gov.ng/'),
  ('', null, 'NG', 'import', 'soncap', 'Standards Organisation of Nigeria', '{"regulated_products":true}', 'SONCAP certificate required for regulated products.', 'https://son.gov.ng/'),
  ('', null, 'NG', 'import', 'nafdac_permit', 'NAFDAC', '{"food_drugs_cosmetics":true}', 'NAFDAC registration/permit required for food, drugs and cosmetics.', 'https://www.nafdac.gov.ng/'),
  ('1801', 'NG', null, 'export', 'nepc_certificate', 'Nigerian Export Promotion Council', '{"all_exports":true}', 'Exporters must register with NEPC.', 'https://nepc.gov.ng/'),
  ('1801', 'NG', null, 'export', 'certificate_of_origin', 'NACCIMA / NEPC', '{"preferential_treatment":true}', 'Certificate of origin needed for preferential tariff treatment.', 'https://naccima.com/'),
  ('1801', 'NG', null, 'export', 'phytosanitary', 'NAQS', '{"plant_products":true}', 'Phytosanitary certificate required for plant products.', null),
  ('0801', 'NG', null, 'export', 'phytosanitary', 'NAQS', '{"plant_products":true}', 'Phytosanitary certificate required for plant products.', null),
  ('1207', 'NG', null, 'export', 'phytosanitary', 'NAQS', '{"plant_products":true}', 'Phytosanitary certificate required for plant products.', null)
on conflict do nothing;

insert into public.document_templates (doc_type, country_scope, name, version) values
  ('commercial_invoice', null, 'Commercial Invoice (Standard)', 1),
  ('packing_list', null, 'Packing List (Standard)', 1),
  ('proforma_invoice', null, 'Proforma Invoice (Standard)', 1),
  ('certificate_of_origin', 'NG', 'Certificate of Origin (NACCIMA)', 1),
  ('bill_of_lading', null, 'Bill of Lading Data Sheet', 1),
  ('form_m', 'NG', 'Form M (CBN)', 1),
  ('paar', 'NG', 'Pre-Arrival Assessment Report', 1)
on conflict do nothing;
