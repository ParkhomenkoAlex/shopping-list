create or replace function public.register_push_token(
    p_token text,
    p_platform text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
    if auth.uid() is null then
        raise exception using
            errcode = '42501',
            message = 'Authentication is required';
    end if;

    if p_platform not in ('android', 'ios') then
        raise exception using
            errcode = '22023',
            message = 'Invalid platform';
    end if;

    insert into public.user_push_tokens (user_id, token, platform, updated_at)
    values (auth.uid(), p_token, p_platform, now())
    on conflict (token) do update
    set user_id = auth.uid(),
        platform = excluded.platform,
        updated_at = now();
end;
$$;

revoke all on function public.register_push_token(text, text) from public;
grant execute on function public.register_push_token(text, text) to authenticated;
