begin;

create temporary table explicit_list_owners (
    list_id uuid primary key,
    user_id uuid not null
) on commit drop;

-- Add only verified mappings here before running this script.
-- Example:
-- insert into explicit_list_owners (list_id, user_id) values
--     ('00000000-0000-0000-0000-000000000000',
--      '00000000-0000-0000-0000-000000000000');

do $$
begin
    if exists (
        select 1
        from explicit_list_owners as mapping
        left join public.lists as list on list.id = mapping.list_id
        where list.id is null
    ) then
        raise exception 'Backfill mapping contains a list_id that does not exist';
    end if;

    if exists (
        select 1
        from explicit_list_owners as mapping
        left join auth.users as user_account on user_account.id = mapping.user_id
        where user_account.id is null
    ) then
        raise exception 'Backfill mapping contains a user_id that does not exist';
    end if;
end;
$$;

with inserted_owners as (
    insert into public.list_members (list_id, user_id, role)
    select
        mapping.list_id,
        mapping.user_id,
        'owner'::public.list_member_role
    from explicit_list_owners as mapping
    on conflict (list_id, user_id) do nothing
    returning list_id
)
select count(*) as owners_created
from inserted_owners;

select
    list.id as list_without_owner
from public.lists as list
where not exists (
    select 1
    from public.list_members as membership
    where membership.list_id = list.id
      and membership.role = 'owner'::public.list_member_role
)
order by list.id;

commit;
