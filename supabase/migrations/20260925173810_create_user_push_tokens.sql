create table public.user_push_tokens (
                                         id uuid primary key default gen_random_uuid(),
                                         user_id uuid not null references auth.users(id) on delete cascade,
                                         token text not null,
                                         platform text not null,
                                         created_at timestamptz not null default now(),
                                         updated_at timestamptz not null default now(),

                                         constraint user_push_tokens_platform_check
                                             check (platform in ('android', 'ios')),
                                         constraint user_push_tokens_token_unique
                                             unique (token)
);

alter table public.user_push_tokens enable row level security;

create policy "Users can read own push tokens"
on public.user_push_tokens
for select
               to authenticated
               using (user_id = auth.uid());

create policy "Users can insert own push tokens"
on public.user_push_tokens
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own push tokens"
on public.user_push_tokens
for update
                      to authenticated
                      using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Users can delete own push tokens"
on public.user_push_tokens
for delete
to authenticated
using (user_id = auth.uid());

create index user_push_tokens_user_id_idx
    on public.user_push_tokens(user_id);
