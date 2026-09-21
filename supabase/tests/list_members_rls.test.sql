create extension if not exists pgtap with schema extensions;

begin;

set local search_path = extensions, public, auth;

select plan(29);

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
        '11111111-1111-1111-1111-111111111111',
        'authenticated',
        'authenticated',
        'owner@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'authenticated',
        'authenticated',
        'member@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    );

select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

insert into public.lists (id, name)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'List A'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'List B');

select is(
    (select count(*) from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1::bigint,
    'authenticated user can create a list'
);

select is(
    (
        select role::text
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '11111111-1111-1111-1111-111111111111'
    ),
    'owner',
    'new list automatically creates an owner membership'
);

reset role;
set local role anon;

select throws_ok(
    $$insert into public.lists (name) values ('Anonymous list')$$,
    '42501',
    'permission denied for table lists',
    'anonymous user cannot create a list'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

select is(
    (select count(*) from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1::bigint,
    'owner can read own list'
);

update public.lists
set name = 'List A updated by owner'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is(
    (select name from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    'List A updated by owner',
    'owner can update own list'
);

insert into public.list_items (id, list_id, name)
values (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Owner item'
);

select is(
    (select count(*) from public.list_items where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    1::bigint,
    'owner can create a list item'
);

update public.list_items
set name = 'Owner item updated'
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select is(
    (select name from public.list_items where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    'Owner item updated',
    'owner can update a list item'
);

delete from public.list_items
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select is(
    (select count(*) from public.list_items where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    0::bigint,
    'owner can delete a list item'
);

insert into public.list_items (id, list_id, name)
values (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Shared item'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);
set local role authenticated;

select is(
    (select count(*) from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    0::bigint,
    'outsider cannot read a list'
);

select is(
    (select count(*) from public.list_items where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    0::bigint,
    'outsider cannot read list items'
);

select throws_ok(
    $$
        insert into public.list_items (list_id, name)
        values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Outsider item')
    $$,
    '42501',
    'new row violates row-level security policy for table "list_items"',
    'outsider cannot create a list item'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

insert into public.list_members (list_id, user_id, role)
values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'member'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);
set local role authenticated;

select is(
    (select count(*) from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1::bigint,
    'member can read a list'
);

update public.lists
set name = 'List A updated by member'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is(
    (select name from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    'List A updated by member',
    'member can update a list'
);

insert into public.list_items (id, list_id, name)
values (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Member item'
);

select is(
    (select count(*) from public.list_items where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    1::bigint,
    'member can create a list item'
);

update public.list_items
set name = 'Member item updated'
where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

select is(
    (select name from public.list_items where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    'Member item updated',
    'member can update a list item'
);

delete from public.list_items
where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

select is(
    (select count(*) from public.list_items where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    0::bigint,
    'member can delete a list item'
);

delete from public.lists
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is(
    (select count(*) from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1::bigint,
    'member cannot delete a list'
);

update public.list_members
set role = 'owner'
where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-2222-2222-222222222222';

select is(
    (
        select role::text
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    ),
    'member',
    'member cannot change own role'
);

delete from public.list_members
where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-2222-2222-222222222222';

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    ),
    1::bigint,
    'member cannot delete own membership'
);

select throws_ok(
    $$
        update public.list_items
        set list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    $$,
    '42501',
    'new row violates row-level security policy for table "list_items"',
    'member cannot move a list item to a foreign list'
);

update public.list_members
set list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-2222-2222-222222222222';

select is(
    (
        select list_id
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    ),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'member cannot move a membership to a foreign list'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

update public.list_members
set role = 'owner'
where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-2222-2222-222222222222';

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and role = 'owner'
    ),
    2::bigint,
    'owner can add a second owner'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);
set local role authenticated;

select is(
    private.is_list_member('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    false,
    'helper function does not grant access to a foreign list'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

select throws_ok(
    $$
        delete from public.list_members
        where list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
          and user_id = '11111111-1111-1111-1111-111111111111'
    $$,
    'P0001',
    'A list must retain at least one owner',
    'last owner cannot be deleted'
);

select throws_ok(
    $$
        update public.list_members
        set role = 'member'
        where list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
          and user_id = '11111111-1111-1111-1111-111111111111'
    $$,
    'P0001',
    'A list must retain at least one owner',
    'last owner cannot be demoted'
);

select lives_ok(
    $$
        insert into public.list_items (list_id, name)
        values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cascade item')
    $$,
    'owner can create an item before cascade deletion'
);

select lives_ok(
    $$
        delete from public.lists
        where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    $$,
    'owner can delete a list with cascade'
);

select is(
    (select count(*) from public.list_members where list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    0::bigint,
    'deleting a list cascades to memberships'
);

select is(
    (select count(*) from public.list_items where list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    0::bigint,
    'deleting a list cascades to list items'
);

select * from finish();

rollback;
