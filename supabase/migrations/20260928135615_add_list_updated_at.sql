alter table public.lists
    add column updated_at timestamptz not null default now();

update public.lists
set updated_at = created_at;


create function private.set_list_updated_at()
    returns trigger
    language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
    new.updated_at := clock_timestamp();

return new;
end;
$$;


create function private.touch_list_from_item()
    returns trigger
    language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
target_list_id uuid;
begin
    if tg_op = 'DELETE' then
        target_list_id := old.list_id;
else
        target_list_id := new.list_id;
end if;

update public.lists
set updated_at = clock_timestamp()
where id = target_list_id;

return coalesce(new, old);
end;
$$;


create function private.touch_list_from_member()
    returns trigger
    language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
target_list_id uuid;
begin
    if tg_op = 'DELETE' then
        target_list_id := old.list_id;
else
        target_list_id := new.list_id;
end if;

    -- Creating a list automatically creates its owner membership.
    -- That initial membership is part of list creation and must not
    -- make updated_at different from created_at.
    if tg_op = 'INSERT'
       and new.role = 'owner'::public.list_member_role
       and exists (
           select 1
           from public.lists
           where id = new.list_id
             and updated_at = created_at
       ) then
        return new;
end if;

update public.lists
set updated_at = clock_timestamp()
where id = target_list_id;

return coalesce(new, old);
end;
$$;


revoke all on function private.set_list_updated_at() from public;
revoke all on function private.touch_list_from_item() from public;
revoke all on function private.touch_list_from_member() from public;


create trigger set_list_updated_at
    before update on public.lists
    for each row
    execute function private.set_list_updated_at();


create trigger touch_list_after_item_change
    after insert or update or delete on public.list_items
    for each row
    execute function private.touch_list_from_item();


create trigger touch_list_after_member_change
    after insert or update or delete on public.list_members
    for each row
    execute function private.touch_list_from_member();