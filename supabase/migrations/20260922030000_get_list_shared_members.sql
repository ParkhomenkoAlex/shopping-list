create function public.get_list_shared_members(target_list_id uuid)
returns table (
    user_id uuid,
    email text,
    role public.list_member_role
)
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

    if not private.is_list_member(target_list_id) then
        raise exception using
            errcode = '42501',
            message = 'Only list members can view shared members';
    end if;

    return query
    select
        membership.user_id,
        user_account.email::text,
        membership.role
    from public.list_members as membership
    join auth.users as user_account on user_account.id = membership.user_id
    where membership.list_id = target_list_id
      and membership.role = 'member'::public.list_member_role
    order by membership.created_at;
end;
$$;

revoke all on function public.get_list_shared_members(uuid) from public;
grant execute on function public.get_list_shared_members(uuid) to authenticated;
