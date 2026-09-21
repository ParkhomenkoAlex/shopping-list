create type public.list_member_role as enum ('owner', 'member');

create table public.list_members (
    list_id uuid not null references public.lists(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.list_member_role not null,
    created_at timestamptz not null default now(),
    primary key (list_id, user_id)
);

create index list_members_user_id_list_id_idx
    on public.list_members (user_id, list_id);

create index list_items_list_id_created_at_idx
    on public.list_items (list_id, created_at);

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_list_member(target_list_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
    select exists (
        select 1
        from public.list_members as membership
        where membership.list_id = target_list_id
          and membership.user_id = auth.uid()
    );
$$;

create function private.is_list_owner(target_list_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
    select exists (
        select 1
        from public.list_members as membership
        where membership.list_id = target_list_id
          and membership.user_id = auth.uid()
          and membership.role = 'owner'::public.list_member_role
    );
$$;

create function private.create_list_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    creator_id uuid := auth.uid();
begin
    if creator_id is null then
        raise exception 'An authenticated user is required to create a list';
    end if;

    insert into public.list_members (list_id, user_id, role)
    values (new.id, creator_id, 'owner'::public.list_member_role);

    return new;
end;
$$;

create function private.prevent_last_list_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
    if old.role <> 'owner'::public.list_member_role then
        if tg_op = 'DELETE' then
            return old;
        end if;

        return new;
    end if;

    if tg_op = 'UPDATE'
       and new.list_id = old.list_id
       and new.role = 'owner'::public.list_member_role then
        return new;
    end if;

    perform 1
    from public.lists
    where id = old.list_id
    for update;

    if not found then
        if tg_op = 'DELETE' then
            return old;
        end if;

        return new;
    end if;

    if not exists (
        select 1
        from public.list_members as membership
        where membership.list_id = old.list_id
          and membership.user_id <> old.user_id
          and membership.role = 'owner'::public.list_member_role
    ) then
        raise exception 'A list must retain at least one owner';
    end if;

    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$$;

revoke all on function private.is_list_member(uuid) from public;
revoke all on function private.is_list_owner(uuid) from public;
revoke all on function private.create_list_owner_membership() from public;
revoke all on function private.prevent_last_list_owner_removal() from public;
grant execute on function private.is_list_member(uuid) to authenticated;
grant execute on function private.is_list_owner(uuid) to authenticated;

create trigger create_list_owner_membership
after insert on public.lists
for each row
execute function private.create_list_owner_membership();

create trigger prevent_last_list_owner_removal
before delete or update of list_id, role on public.list_members
for each row
execute function private.prevent_last_list_owner_removal();
