create function public.add_list_member_by_email(
    target_list_id uuid,
    target_email text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    caller_id uuid := auth.uid();
    normalized_email text := lower(btrim(target_email));
    target_user_id uuid;
begin
    if caller_id is null then
        raise exception using
            errcode = '42501',
            message = 'Authentication is required';
    end if;

    if not private.is_list_owner(target_list_id) then
        raise exception using
            errcode = '42501',
            message = 'Only the list owner can add members';
    end if;

    if normalized_email is null or normalized_email = '' then
        raise exception using
            errcode = 'P0001',
            message = 'Unable to add member';
    end if;

    select user_account.id
    into target_user_id
    from auth.users as user_account
    where lower(user_account.email) = normalized_email;

    if target_user_id is null then
        raise exception using
            errcode = 'P0001',
            message = 'Unable to add member';
    end if;

    if target_user_id = caller_id then
        raise exception using
            errcode = 'P0001',
            message = 'Cannot add yourself as a member';
    end if;

    if exists (
        select 1
        from public.list_members as membership
        where membership.list_id = target_list_id
          and membership.user_id = target_user_id
    ) then
        raise exception using
            errcode = 'P0001',
            message = 'User is already a list member';
    end if;

    begin
        insert into public.list_members (list_id, user_id, role)
        values (
            target_list_id,
            target_user_id,
            'member'::public.list_member_role
        );
    exception
        when unique_violation then
            raise exception using
                errcode = 'P0001',
                message = 'User is already a list member';
    end;
end;
$$;

revoke all on function public.add_list_member_by_email(uuid, text) from public;
grant execute on function public.add_list_member_by_email(uuid, text) to authenticated;
