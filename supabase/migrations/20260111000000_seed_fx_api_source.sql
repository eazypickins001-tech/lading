insert into public.data_sources (name, category, base_url, access_method, cadence, parser_key)
select 'Exchange Rate API (NGN)', 'fx', 'https://open.er-api.com/v6/latest/NGN', 'api', 'daily', 'erapi_fx'
where not exists (
  select 1 from public.data_sources where name = 'Exchange Rate API (NGN)'
);
