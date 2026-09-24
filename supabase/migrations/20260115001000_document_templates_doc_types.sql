insert into public.document_templates (doc_type, country_scope, name, version) values
  ('shippers_letter_of_instruction', null, 'Shipper''s Letter of Instruction', 1),
  ('vgm_declaration', null, 'VGM Declaration', 1),
  ('packing_declaration', null, 'Packing Declaration', 1)
on conflict do nothing;
