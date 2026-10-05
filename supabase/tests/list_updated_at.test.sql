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

select lives_ok(
               $$
                   insert into public.lists (id, name)
        values (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'Timestamp list'
        )
    $$,
               'owner can create a list'
       );

select ok(
               (
                   select updated_at is not null
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'new list has a non-null updated_at'
       );

select is(
    (
    select updated_at
    from public.lists
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    (
    select created_at
    from public.lists
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    'new list initially has updated_at equal to created_at'
    );

select pg_sleep(0.01);

select lives_ok(
               $$
                   update public.lists
        set name = 'Timestamp list updated'
        where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    $$,
               'owner can update the list'
       );

select ok(
               (
                   select updated_at > created_at
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'updating a list advances updated_at'
       );

select pg_sleep(0.01);

update public.lists
set updated_at = '2000-01-01 00:00:00+00'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select ok(
               (
                   select updated_at > '2000-01-01 00:00:00+00'
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'client cannot spoof updated_at'
       );

select pg_sleep(0.01);

select lives_ok(
               $$
                   insert into public.list_items (
            id,
            list_id,
            name
        )
        values (
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'Timestamp item'
        )
    $$,
               'owner can create a list item'
       );

select ok(
               (
                   select updated_at > created_at
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'creating a list item advances updated_at'
       );

select pg_sleep(0.01);

update public.list_items
set name = 'Timestamp item updated'
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select ok(
               (
                   select updated_at >
                          (
                              select created_at
                              from public.lists
                              where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
                          )
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'updating a list item advances updated_at'
       );

select pg_sleep(0.01);

delete from public.list_items
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select ok(
               (
                   select updated_at >
                          (
                              select created_at
                              from public.lists
                              where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
                          )
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'deleting a list item advances updated_at'
       );

select pg_sleep(0.01);

select lives_ok(
               $$
                   insert into public.list_members (
            list_id,
            user_id,
            role
        )
        values (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '22222222-2222-2222-2222-222222222222',
            'member'
        )
    $$,
               'owner can add a member'
       );

select ok(
               (
                   select updated_at >
                          (
                              select created_at
                              from public.lists
                              where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
                          )
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'adding a member advances updated_at'
       );

select pg_sleep(0.01);

delete from public.list_members
where list_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-2222-2222-222222222222';

select ok(
               (
                   select updated_at >
                          (
                              select created_at
                              from public.lists
                              where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
                          )
                   from public.lists
                   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
               ),
               'deleting a member advances updated_at'
       );

select * from finish();

rollback;