create table list_items (
                            id uuid primary key default gen_random_uuid(),
                            list_id uuid not null references lists(id) on delete cascade,
                            name text not null,
                            is_completed boolean not null default false,
                            created_at timestamptz not null default now()
);