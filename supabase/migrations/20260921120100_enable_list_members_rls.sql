-- Legacy lists can exist without memberships when their historical owner is
-- unknown. They remain stored, but RLS denies ordinary users all access until
-- a separate, verified owner backfill creates a membership.

revoke all on table public.lists from anon;
revoke all on table public.list_members from anon;
revoke all on table public.list_items from anon;

revoke all on table public.lists from authenticated;
revoke all on table public.list_members from authenticated;
revoke all on table public.list_items from authenticated;

grant select, insert, update, delete on table public.lists to authenticated;
grant select, insert, update, delete on table public.list_members to authenticated;
grant select, insert, update, delete on table public.list_items to authenticated;

alter table public.lists enable row level security;
alter table public.list_members enable row level security;
alter table public.list_items enable row level security;

create policy "Lists are readable by members"
on public.lists
for select
to authenticated
using (private.is_list_member(id));

create policy "Authenticated users can create lists"
on public.lists
for insert
to authenticated
with check (auth.uid() is not null);

create policy "Members can update lists"
on public.lists
for update
to authenticated
using (private.is_list_member(id))
with check (private.is_list_member(id));

create policy "Owners can delete lists"
on public.lists
for delete
to authenticated
using (private.is_list_owner(id));

create policy "Members can read list items"
on public.list_items
for select
to authenticated
using (private.is_list_member(list_id));

create policy "Members can create list items"
on public.list_items
for insert
to authenticated
with check (private.is_list_member(list_id));

create policy "Members can update list items"
on public.list_items
for update
to authenticated
using (private.is_list_member(list_id))
with check (private.is_list_member(list_id));

create policy "Members can delete list items"
on public.list_items
for delete
to authenticated
using (private.is_list_member(list_id));

create policy "Members can read list memberships"
on public.list_members
for select
to authenticated
using (private.is_list_member(list_id));

create policy "Owners can create list memberships"
on public.list_members
for insert
to authenticated
with check (private.is_list_owner(list_id));

create policy "Owners can update list memberships"
on public.list_members
for update
to authenticated
using (private.is_list_owner(list_id))
with check (private.is_list_owner(list_id));

create policy "Owners can delete list memberships"
on public.list_members
for delete
to authenticated
using (private.is_list_owner(list_id));
