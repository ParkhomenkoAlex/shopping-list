-- Legacy lists can have no memberships. For every list with memberships,
-- this index prevents more than one owner membership.
create unique index list_members_one_owner_per_list_idx
    on public.list_members (list_id)
    where role = 'owner'::public.list_member_role;
