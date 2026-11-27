# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

All application UI strings, accessibility labels, application-generated messages,
source code identifiers and comments must be written in English. User-generated
content may use any language.

# Database safety

- Every migration must preserve existing user data. Do not implement automatic
  deletion, recreation, or destructive backfills of existing data.
- Apply pending local migrations with `supabase migration up --local`; never use
  `supabase db reset` for routine migration work.
- A local database reset and every destructive administrative database operation
  require explicit owner approval in advance.
- Database reset is categorically prohibited for Development and Production.
- Remote migrations and deployments require explicit owner approval in advance.
- Before any remote migration, verify the target environment, migration history,
  SQL changes, and a current recoverable backup. A verified recovery plan is
  mandatory before a Production migration.
- Run SQL/RLS tests and test seeds only against Local or a specifically isolated
  test database, never a cloud environment.
- Ordinary authorized application CRUD is not restricted by these safeguards.
