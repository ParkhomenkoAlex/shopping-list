# Shopping List

Expo React Native app for shared shopping lists. Supabase provides auth, data
and realtime; TanStack Query handles server state; Expo Notifications and Sentry
support production operation.

## Stack

Expo SDK 57, React Native, TypeScript, Expo Router, Supabase, TanStack Query,
NetInfo, Expo Notifications, Sentry, pnpm and GitHub Actions.

## Prerequisites

- Node.js 22 and pnpm 10.11.0
- Android Studio, Android SDK Platform Tools and `adb` for Android work
- JDK 17 for reproducible Android/Gradle builds
- Docker Desktop and Supabase CLI only for local Supabase work

```bash
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` runs Prettier, Expo ESLint and TypeScript. GitHub `CI` runs the same
quality gates for pull requests and pushes to `develop`/`master`; it never deploys
or builds APKs.

## Environments and local development

| Environment | Env file           | Android package                    | Start command |
| ----------- | ------------------ | ---------------------------------- | ------------- |
| Local       | `.env.local`       | `com.anonymous.shoppinglist.local` | `pnpm local`  |
| Development | `.env.development` | `com.anonymous.shoppinglist.dev`   | `pnpm dev`    |
| Production  | `.env.production`  | `com.anonymous.shoppinglist`       | `pnpm prod`   |

Each env file needs target-specific public runtime values:

```text
EXPO_PUBLIC_APP_ENV=Local|Dev|Prod
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_SENTRY_DSN=...
```

Never commit env files, private tokens or Firebase credentials. `app.config.ts`
selects the matching tracked `firebase/google-services.<environment>.json`.

Use `pnpm local:pixel9`, `pnpm dev:pixel9` (or `pixel10`) for the configured
secondary emulators. Diagnose connected devices with:

```bash
adb devices -l
pnpm env:check
```

## Supabase

```bash
supabase start
pnpm db:status
pnpm db:migration:new <name>
pnpm db:migration:up
pnpm db:migration:list
pnpm db:types
pnpm db:test:local
pnpm db:seed:local
```

`db:migration:up`, `db:migration:list`, `db:test:local` and `db:seed:local` are
explicitly Local-only commands. The seed command only accepts the Local API on
`127.0.0.1`, `localhost`, or Android emulator alias `10.0.2.2` port `54321`; it
is idempotent and does not update existing rows or passwords.

Use `supabase migration up --local` for routine Local migrations. Do not run
`supabase db reset` without explicit owner approval. Never reset Development or
Production. Remote migrations require explicit owner approval, target and
migration-history verification, SQL review, and a current recoverable backup;
Production also requires a verified recovery plan. SQL/RLS tests and seed data
must stay on Local or an isolated test database.

## Android APKs

```bash
pnpm build:apk:dev
pnpm install:apk:dev
pnpm start:apk:dev

APP_BUILD_NUMBER=202 pnpm build:apk:prod
ANDROID_SERIAL=emulator-5554 pnpm install:apk:prod
ANDROID_SERIAL=emulator-5554 pnpm start:apk:prod
```

`install:apk:*` uses `adb install -r`, preserves data and rejects an APK for the
wrong environment. APK names use `SL-{Dev|Prod}-{build}-v{version}.apk`.

Release source-map upload requires private `SENTRY_AUTH_TOKEN`. Local builds use
the macOS Keychain service `shopping-list-sentry-auth-token` for the current user
or the environment. Use `SENTRY_DISABLE_AUTO_UPLOAD=true` only for an explicit
non-monitoring build.

## Manual deployment and push notifications

`Supabase Development` and `Supabase Production` are manual
`workflow_dispatch` workflows. They deploy migrations and Edge Functions, then
build/upload the matching APK. Pull requests, pushes and merges never deploy.
They only accept `develop` and `master` respectively, require a current-backup
and recovery-plan confirmation, serialize deployments per environment, and stop
when the remote migration history or dry-run plan changes between review and
apply.

Before enabling either workflow, create GitHub Environments named
`development` and `production`. Configure required reviewers for both, with a
separate Production approver, then scope these secrets to the matching
Environment: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DEV_PROJECT_REF` or
`SUPABASE_PROD_PROJECT_REF`, the matching `EXPO_PUBLIC_SUPABASE_*` values,
`SENTRY_AUTH_TOKEN`, and the matching Sentry DSN. Add the non-secret
Environment variable `SUPABASE_EXPECTED_PROJECT_REF` with the same project ref
as that Environment's project-ref secret. The workflows stop if those values do
not match. Do not print or commit their values.

Before dispatch, manually verify the target project, remote migration history,
SQL changes, and a current recoverable backup. For Production, verify the
recovery plan and restore procedure as well. Inspect the uploaded migration
preflight artifact before approving the deploy job. GitHub Environment approval
is required before the deployment job can use `--yes` to apply migrations. The
same Environment also protects the read-only plan job because it supplies the
environment-scoped credentials, so reviewers approve twice by design: first to
generate the preflight artifact, then to deploy the unchanged normalized plan.

The authenticated client registers an Expo push token after permission approval.
`notify-list-members` sends notifications, and a notification tap routes to
`/lists/<id>`. Keep the target Firebase file, Expo/EAS project ID and push
credentials configured; test delivery on a physical device or release build.

## Project guidance

- Current roadmap and pending verification: [`REDESIGN_STEPS.md`](REDESIGN_STEPS.md)
- Soft Indigo system: [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md)
- Approved visual baseline: [`docs/design/prototype.html`](docs/design/prototype.html)
- Agent instruction: [`AGENTS.md`](AGENTS.md)

Git history contains completed implementation detail; the roadmap contains only
active and unresolved work.
