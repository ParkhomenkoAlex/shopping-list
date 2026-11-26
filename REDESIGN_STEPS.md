# Shopping List — Roadmap

## Current status

- **Active work:** UI/UX Redesign — R4 My Lists.
- **Visual baseline:** Soft Indigo v0.2
  [`docs/design/prototype.html`](docs/design/prototype.html).
- **Design rules:** [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md).
- **Reliability:** Phase 10 is implemented in source and partially verified;
  Production and physical-device evidence remains pending.

Visual review: prototype → React Native implementation → emulator screenshots →
comparison → corrections → owner approval → commit.

Each intermediate redesign phase requires quality checks and relevant emulator
verification after it is integrated into a screen. Release APK verification is
required for release-sensitive changes and the final regression, not every UI commit.

## UI/UX Redesign

### Approved decisions

- Use the Design System's predefined Ionicons catalog and eight semantic colors.
  Persist shared `icon_key`/`color_key` list metadata; legacy lists default to
  `groceries`/`indigo` and authorized members synchronize the appearance.
- Counters/progress use one aggregate backend query; N+1 item reads are
  prohibited. R7 investigates an RLS-compatible RPC or view.
- Search filters already loaded authorized lists. Completed collapse is local.
- Auth uses the owner-approved bundled 3D grocery bag illustration, replacing the
  prototype illustration. Account avatar is the first email letter; no profiles or
  uploaded avatars are added.
- Light theme is the baseline. Dark theme, haptics and extra animation need later
  approval. Add no dependency without technical justification.
- English is the only application interface language. UI strings, accessibility labels,
  application-generated messages, source identifiers and comments are English;
  user-generated content may use any language.

### Non-regression contract

Preserve auth/session recovery, protected routes and `/lists` cold start, deep
links/notification navigation, Supabase RLS, React Query/realtime/invalidation,
offline/retry/cached-data states, per-entity mutation guards, duplicate navigation,
push notifications and Sentry.

### R0–R9

- [x] **R0 Planning:** audit, approved baseline, decisions and design system.
- [x] **R1 Tokens/foundations:**
      `src/theme/{tokens,semantic,listAppearance}.ts` and presentational `Button`,
      `TextField`, `Screen`, `StatePanel`. No screen, Router, hook, service, schema or
      dependency change. Token parity, quality checks and accessibility props are
      verified. Visual and accessibility emulator verification occurs during each
      primitive's first screen integration.
- [x] **R2 Navigation & Layout — accepted:** root and protected Stacks suppress
      generated headers; Auth and My Lists own their titles, while List Details owns Back
      and list actions through `ListHeader`. `Screen` applies explicit top/bottom
      safe-area edges without adding a second provider. History-less cold deep links to
      `/lists/[id]` replace to `/lists` on custom or Android Back; ordinary navigation
      preserves Router Back history. Pixel 8 Local verification passed for auth/session
      recovery, CRUD, offline/reconnect, headers/safe areas/StatusBar/FAB, ordinary
      navigation, duplicate-navigation protection, and warm/cold List Details deep links
      including both Back paths. Runtime accessibility remains pending.
- [x] **R0–R2 intermediate integration and Development validation checkpoint:**
      PR #53 integrated R0–R2. Development deployment and physical Android regression
      completed; cold-start push navigation was discovered there. PR #54 (`9403267`)
      added the initial fix and PR #55 (`e9dea60`) completed navigation-readiness and
      lifecycle handling. Dev Client regression passed 11/11, lifecycle regression
      8/8, and the final no-diagnostics smoke test 4/4. Physical notification navigation
      is user-confirmed; temporary diagnostics are removed. Local Release APK testing
      was intentionally skipped in favor of the CI-generated Dev APK on physical Android.
      The deployed APK commit was not independently verified; Production remains untouched.
      `user.email || 'Member'` is source-verified, while the missing-email runtime path
      remains untested and non-blocking. Feature and develop branch synchronization is complete.
- [x] **R3 Authentication — accepted:** owner-approved 3D grocery bag illustration,
      `Screen`, `Button`, `TextField`, `BuildVersionLabel` and existing tokens compose
      the auth screen. Explicit Sign in/Register selection preserves auth logic, protected
      navigation, build label, pending/error behavior and credentials. Owner-confirmed
      visual and functional verification passed on Pixel 8 and Pixel 9, including keyboard,
      validation, error handling, registration, sign-in, duplicate submission, logout and
      session restoration. Static checks passed; no dependency or backend change; Production
      remains untouched. Dedicated screen-reader testing remains pending.
- [ ] **R4 My Lists — active:** cards, search and account/logout menu. Do not show real
      counters/progress before R7. Verify loading/offline/error/empty states and
      duplicate-navigation guard.
- [ ] **R5 List Details/items:** compact rows, quick-create UI, list actions and
      local completed collapse; retain CRUD, Retry and granular pending behavior.
- [ ] **R6 Sheets/sharing:** consistent create/edit/delete/action/sharing UI;
      preserve ownership, add/remove guards, Retry and notify.
- [ ] **R7 Appearance/statistics data:** separate approval required. Migrate and
      backfill semantic keys with `CHECK`s, regenerate types, implement one authorized
      aggregate RPC/view and picker persistence. Verify defaults, SQL/RLS isolation,
      no N+1, realtime sync, mutation/cache invalidation, reconnect, offline states,
      Dev deployment and list CRUD. Split data/API and UI commits.
- [ ] **R8 State polish:** consistent loading/empty/error/offline/disabled UI and
      localization review without changing reliability semantics.
- [ ] **R9 Final review:** screenshot comparison plus applicable auth, route,
      notification, realtime, offline and Sentry regression checks.

Design references: Apple Reminders, AnyList, Bring! and Todoist inform work but
do not override the approved prototype.

## Reliability and deployment

### Implemented; preserve during redesign

- Startup recovery, timeout/Retry and stored-session race guards.
- Authenticated offline cold start to `/lists`; reconnect recovery and honest
  no-cache offline states.
- List/detail/item/sharing loading, Retry, error, cached-data and granular
  pending states; same-card duplicate navigation guard.
- Sentry runtime integration/privacy defaults/Dev symbolication; temporary test UI
  removed.
- Quality CI and Ruleset; verified Development manual deployment with Supabase CLI
  3.3.0 and Temurin JDK 17.

### Pending verification

- Auth failure/Retry, long background, unstable network, Supabase unavailable,
  expired/revoked session and app update with persisted session.
- Dedicated screen-reader testing for R3 Authentication.
- Rapid taps on different cards, concurrent item or member operations and pending
  cleanup after mutation failure. List Details warm/cold deep-link navigation and both
  Back paths are verified on Pixel 8 Local; notification navigation is verified on
  emulator Dev Clients and user-confirmed on a physical Android CI-generated Dev APK.
- Production APK, Production Sentry/source maps, native crash reporting and received-event
  privacy audit. Physical Android coverage is limited to the completed Development regression.
- Production deployment, CI-generated APK Sentry delivery/source maps, and manual
  CI/ruleset execution on `master`.
- The English fallback sender `user.email || 'Member'` is source-verified. Its
  missing-email runtime scenario remains a non-blocking verification item.

### Deferred

- Persistent React Query cache/offline-first data.
- Offline mutations: reject clearly or intentionally queue/synchronize; no
  implicit queue.
- Deployment hardening (guards, concurrency, environments, preflight, signing,
  dynamic artifacts and partial-recovery automation).
- Automated component/provider tests, isolated Supabase pgTAP CI, Expo Doctor and
  Edge Function Deno validation.

## Completion rule

Run `pnpm check`; test affected release APKs; record device, build, network state
and outcome. Do not mark Production or physical-device requirements complete
without independent evidence.
