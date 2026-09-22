revoke update on table public.list_members from authenticated;

drop policy "Owners can create list memberships" on public.list_members;
drop policy "Owners can update list memberships" on public.list_members;

create policy "Owners can create member memberships"
on public.list_members
for insert
to authenticated
with check (
    private.is_list_owner(list_id)
    and role = 'member'::public.list_member_role
);
