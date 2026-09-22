create extension if not exists pgtap with schema extensions;

begin;

set local search_path = extensions, public, auth;

select plan(62);

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
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'second-owner@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'authenticated',
        'authenticated',
        'outsider@example.test',
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now()
    );

alter table public.lists disable trigger create_list_owner_membership;

insert into public.lists (id, name)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Legacy list');

insert into public.list_items (id, list_id, name)
values (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Legacy item'
);

alter table public.lists enable trigger create_list_owner_membership;

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    ),
    0::bigint,
    'legacy list without membership remains valid under the single-owner constraint'
);

select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

select lives_ok(
    $$
        insert into public.lists (id, name)
        values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'List A')
    $$,
    'authenticated user can insert a list without returning it'
);

insert into public.lists (id, name)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'List B');

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

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and role = 'owner'::public.list_member_role
    ),
    1::bigint,
    'new list has exactly one owner'
);

select is(
    (select name from public.lists where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    'List A',
    'new owner can select a list after a separate insert'
);

select throws_ok(
    $$
        insert into public.lists (id, name)
        values ('99999999-9999-9999-9999-999999999999', 'Returning list')
        returning id, name, description
    $$,
    '42501',
    'new row violates row-level security policy for table "lists"',
    'insert with returning fails before the owner membership is visible to list RLS'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);

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

select is(
    (select count(*) from public.lists where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    0::bigint,
    'authenticated user without membership cannot read a legacy list'
);

select is(
    (select count(*) from public.list_items where list_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    0::bigint,
    'authenticated user without membership cannot read legacy list items'
);

update public.lists
set name = 'Unauthorized legacy update'
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

reset role;

select is(
    (select name from public.lists where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    'Legacy list',
    'authenticated user without membership cannot update a legacy list'
);

select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);
set local role authenticated;

delete from public.lists
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

reset role;

select is(
    (select count(*) from public.lists where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    1::bigint,
    'authenticated user without membership cannot delete a legacy list'
);

select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);
set local role authenticated;

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

select lives_ok(
    $$
        insert into public.list_members (list_id, user_id, role)
        values (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '22222222-2222-2222-2222-222222222222',
            'member'
        )
    $$,
    'owner can add a member'
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

select throws_ok(
    $$
        update public.list_members
        set role = 'owner'
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    '42501',
    'permission denied for table list_members',
    'member cannot change a membership role'
);

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

select throws_ok(
    $$
        update public.list_members
        set list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    '42501',
    'permission denied for table list_members',
    'member cannot change a membership list'
);

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

select throws_ok(
    $$
        insert into public.list_members (list_id, user_id, role)
        values (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '33333333-3333-3333-3333-333333333333',
            'owner'
        )
    $$,
    '42501',
    'new row violates row-level security policy for table "list_members"',
    'owner cannot add a second owner'
);

select throws_ok(
    $$
        update public.list_members
        set role = 'owner'
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    '42501',
    'permission denied for table list_members',
    'owner cannot promote a member to a second owner'
);

select throws_ok(
    $$
        update public.list_members
        set user_id = '33333333-3333-3333-3333-333333333333'
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    '42501',
    'permission denied for table list_members',
    'owner cannot reassign a membership user'
);

select throws_ok(
    $$
        update public.list_members
        set list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    '42501',
    'permission denied for table list_members',
    'owner cannot move a membership to another list'
);

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and role = 'owner'::public.list_member_role
    ),
    1::bigint,
    'list retains exactly one owner'
);

select is(
    (
        select jsonb_build_object(
            'list_id',
            list_id,
            'user_id',
            user_id,
            'role',
            role::text
        )
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    ),
    jsonb_build_object(
        'list_id',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        'user_id',
        '22222222-2222-2222-2222-222222222222'::uuid,
        'role',
        'member'
    ),
    'forbidden membership mutations leave the member unchanged'
);

select lives_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'second-owner@example.test'
        )
    $$,
    'owner can add an existing user by email'
);

select is(
    (
        select role::text
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '33333333-3333-3333-3333-333333333333'
    ),
    'member',
    'email path creates a member role'
);

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and role = 'owner'::public.list_member_role
    ),
    1::bigint,
    'email path cannot create ownership'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'owner@example.test'
        )
    $$,
    'P0001',
    'Cannot add yourself as a member',
    'owner cannot add themselves as a member'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'member@example.test'
        )
    $$,
    'P0001',
    'User is already a list member',
    'owner cannot add an existing member'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'owner@example.test'
        )
    $$,
    'P0001',
    'Cannot add yourself as a member',
    'owner cannot add an existing owner'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'unknown@example.test'
        )
    $$,
    'P0001',
    'Unable to add member',
    'unknown email returns a safe error'
);

select is(
    (
        select jsonb_agg(
            jsonb_build_object(
                'user_id',
                user_id,
                'email',
                email,
                'role',
                role::text
            )
        )
        from public.get_list_shared_members(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        )
    ),
    jsonb_build_array(
        jsonb_build_object(
            'user_id', '22222222-2222-2222-2222-222222222222'::uuid,
            'email', 'member@example.test',
            'role', 'member'
        ),
        jsonb_build_object(
            'user_id', '33333333-3333-3333-3333-333333333333'::uuid,
            'email', 'second-owner@example.test',
            'role', 'member'
        )
    ),
    'owner can view shared members without seeing the owner'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '33333333-3333-3333-3333-333333333333',
    true
);
set local role authenticated;

select is(
    (
        select count(*)
        from public.get_list_shared_members(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        )
    ),
    2::bigint,
    'member can view shared members'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'outsider@example.test'
        )
    $$,
    '42501',
    'Only the list owner can add members',
    'member cannot add a user by email'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '44444444-4444-4444-4444-444444444444',
    true
);
set local role authenticated;

select throws_ok(
    $$
        select public.get_list_shared_members(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        )
    $$,
    '42501',
    'Only list members can view shared members',
    'outsider cannot view shared members'
);

select lives_ok(
    $$
        insert into public.lists (id, name)
        values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'List C')
    $$,
    'user can own another list'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'member@example.test'
        )
    $$,
    '42501',
    'Only the list owner can add members',
    'owner of another list cannot add a user to a foreign list'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);

select throws_ok(
    $$
        select public.get_list_shared_members(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        )
    $$,
    '42501',
    'Authentication is required',
    'anonymous user cannot view shared members'
);

select throws_ok(
    $$
        select public.add_list_member_by_email(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'outsider@example.test'
        )
    $$,
    '42501',
    'Authentication is required',
    'anonymous user cannot add a member by email'
);

reset role;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

select lives_ok(
    $$
        delete from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    $$,
    'owner can delete a member'
);

select is(
    (
        select count(*)
        from public.list_members
        where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
          and user_id = '22222222-2222-2222-2222-222222222222'
    ),
    0::bigint,
    'deleted member no longer has a membership'
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

reset role;

select throws_ok(
    $$
        update public.list_members
        set role = 'member'
        where list_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
          and user_id = '11111111-1111-1111-1111-111111111111'
    $$,
    'P0001',
    'A list must retain at least one owner',
    'last owner cannot be demoted when update permissions are bypassed'
);

select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);
set local role authenticated;

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
