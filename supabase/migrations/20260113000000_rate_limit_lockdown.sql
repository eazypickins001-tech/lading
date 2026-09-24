revoke all on function public.check_rate_limit(text, integer, integer)
  from anon, authenticated, public;

grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
