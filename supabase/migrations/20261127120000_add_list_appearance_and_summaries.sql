alter table public.lists
    add column icon_key text not null default 'groceries',
    add column color_key text not null default 'indigo',
    add constraint lists_icon_key_check
        check (
            icon_key in (
                'groceries',
                'home',
                'favorites',
                'produce',
                'gifts',
                'cafe',
                'travel',
                'work'
            )
        ),
    add constraint lists_color_key_check
        check (
            color_key in (
                'indigo',
                'blue',
                'green',
                'teal',
                'purple',
                'pink',
                'amber',
                'gray'
            )
        );

create function public.get_accessible_list_summaries()
returns table (
    id uuid,
    name text,
    description text,
    created_at timestamptz,
    updated_at timestamptz,
    icon_key text,
    color_key text,
    owner_id uuid,
    membership_role public.list_member_role,
    item_count bigint,
    completed_item_count bigint
)
language sql
stable
security invoker
set search_path = pg_catalog
as $$
    select
        list.id,
        list.name,
        list.description,
        list.created_at,
        list.updated_at,
        list.icon_key,
        list.color_key,
        owner_membership.user_id as owner_id,
        current_membership.role as membership_role,
        count(item.id) as item_count,
        count(item.id) filter (where item.is_completed) as completed_item_count
    from public.lists as list
    join public.list_members as current_membership
        on current_membership.list_id = list.id
       and current_membership.user_id = auth.uid()
    join public.list_members as owner_membership
        on owner_membership.list_id = list.id
       and owner_membership.role = 'owner'::public.list_member_role
    left join public.list_items as item
        on item.list_id = list.id
    group by
        list.id,
        list.name,
        list.description,
        list.created_at,
        list.updated_at,
        list.icon_key,
        list.color_key,
        owner_membership.user_id,
        current_membership.role
    order by list.created_at;
$$;

revoke all on function public.get_accessible_list_summaries() from public;
grant execute on function public.get_accessible_list_summaries() to authenticated;
