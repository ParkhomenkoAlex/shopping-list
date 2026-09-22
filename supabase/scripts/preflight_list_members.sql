select count(*) as lists_count
from public.lists;

-- Lists without owners are legacy historical exceptions and must not receive
-- automatic owner memberships without a verified mapping.
select count(*) as lists_without_owner_count
from public.lists as list
where not exists (
    select 1
    from public.list_members as membership
    where membership.list_id = list.id
      and membership.role = 'owner'::public.list_member_role
);

select count(*) as list_items_count
from public.list_items;

select count(*) as memberships_count
from public.list_members;

select count(*) as owners_count
from public.list_members
where role = 'owner'::public.list_member_role;

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

select
    membership.list_id,
    membership.user_id
from public.list_members as membership
left join auth.users as user_account on user_account.id = membership.user_id
where user_account.id is null;

select
    membership.list_id,
    membership.user_id
from public.list_members as membership
left join public.lists as list on list.id = membership.list_id
where list.id is null;

select
    list_id,
    user_id,
    count(*) as membership_count
from public.list_members
group by list_id, user_id
having count(*) > 1;

select
    list_id,
    count(*) as owner_count
from public.list_members
where role = 'owner'::public.list_member_role
group by list_id
having count(*) > 1;
