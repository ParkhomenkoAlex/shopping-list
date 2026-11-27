revoke execute on function public.get_accessible_list_summaries() from public;
revoke execute on function public.get_accessible_list_summaries() from anon;
grant execute on function public.get_accessible_list_summaries() to authenticated;
