create extension if not exists pgtap with schema extensions;

begin;

set local search_path = extensions, public, auth;

select plan(13);

insert into auth.users (
    id,
    aud,
    role,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
values
    (
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'authenticated',
        'authenticated',
        'summary-owner@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    ),
    (
        'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'authenticated',
        'authenticated',
        'summary-member@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    ),
    (
        'ccccccc3-cccc-cccc-cccc-ccccccccccc3',
        'authenticated',
        'authenticated',
        'summary-outsider@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    );

alter table public.lists disable trigger create_list_owner_membership;

insert into public.lists (id, name, icon_key, color_key)
values
    (
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Owner list',
        'home',
        'green'
    ),
    (
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Shared list',
        'travel',
        'amber'
    ),
    ('33333333-cccc-cccc-cccc-cccccccccccc', 'Private list', 'work', 'blue');

insert into public.lists (id, name)
values ('44444444-dddd-dddd-dddd-dddddddddddd', 'Legacy defaults');

alter table public.lists enable trigger create_list_owner_membership;

insert into public.list_members (list_id, user_id, role)
values
    (
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'owner'
    ),
    (
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'owner'
    ),
    (
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'member'
    ),
    (
        '33333333-cccc-cccc-cccc-cccccccccccc',
        'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'owner'
    );

insert into public.list_items (list_id, name, is_completed)
values
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Milk', true),
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bread', false),
    ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Coffee', true),
    ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tea', true),
    ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fruit', false);

select is(
    (select icon_key from public.lists where id = '44444444-dddd-dddd-dddd-dddddddddddd'),
    'groceries',
    'existing lists receive the default icon key'
);

select is(
    (select color_key from public.lists where id = '44444444-dddd-dddd-dddd-dddddddddddd'),
    'indigo',
    'existing lists receive the default color key'
);

select throws_ok(
    $$
        update public.lists
        set icon_key = 'unknown'
        where id = '44444444-dddd-dddd-dddd-dddddddddddd'
    $$,
    '23514',
    null,
    'invalid icon keys are rejected'
);

select throws_ok(
    $$
        update public.lists
        set color_key = 'unknown'
        where id = '44444444-dddd-dddd-dddd-dddddddddddd'
    $$,
    '23514',
    null,
    'invalid color keys are rejected'
);

select set_config(
    'request.jwt.claim.sub',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    true
);
set local role authenticated;

select is(
    (select count(*) from public.get_accessible_list_summaries()),
    2::bigint,
    'owner receives only owned and shared list summaries'
);

select is(
    (
        select membership_role::text
        from public.get_accessible_list_summaries()
        where id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    'owner',
    'summary returns the current owner role'
);

select is(
    (
        select membership_role::text
        from public.get_accessible_list_summaries()
        where id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ),
    'member',
    'summary returns the current member role'
);

select is(
    (
        select owner_id
        from public.get_accessible_list_summaries()
        where id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ),
    'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
    'summary returns the list owner id'
);

select is(
    (
        select item_count
        from public.get_accessible_list_summaries()
        where id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    2::bigint,
    'summary returns item count without per-list reads'
);

select is(
    (
        select completed_item_count
        from public.get_accessible_list_summaries()
        where id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ),
    2::bigint,
    'summary returns completed item count without per-list reads'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    'ccccccc3-cccc-cccc-cccc-ccccccccccc3',
    true
);
set local role authenticated;

select is(
    (select count(*) from public.get_accessible_list_summaries()),
    0::bigint,
    'outsider cannot receive list summaries'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);

select ok(
    not has_function_privilege(
        'anon',
        'public.get_accessible_list_summaries()',
        'EXECUTE'
    ),
    'anonymous users do not have execute privilege for list summaries'
);

select throws_ok(
    $$select * from public.get_accessible_list_summaries()$$,
    '42501',
    'permission denied for function get_accessible_list_summaries',
    'anonymous users cannot execute list summaries'
);

select * from finish();

rollback;
