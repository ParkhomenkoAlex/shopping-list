# Shopping List — Roadmap

## Current status

- **Active work:** R4 — Friendly Edition assets and design system.
- **Approved visual reference:** Soft Indigo v0.3 — Friendly Edition in
  [docs/design/prototype.html](docs/design/prototype.html).
- **Design conventions:**
  [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md).
- **Reliability:** Phase 10 is implemented in source and partially verified;
  Production and remaining physical-device evidence are still required.

Visual review: prototype → React Native implementation → emulator screenshots →
comparison → corrections → owner approval → commit. Each phase also requires
quality checks and relevant functional verification. Release APK testing is for
release-sensitive changes and final regression, not every UI commit.

## UI/UX Redesign

### Approved direction and constraints

Soft Indigo v0.3 — Friendly Edition is the approved visual and interaction
reference. Explicit owner-approved product decisions remain authoritative for
functionality. Prototype simulations and temporary artwork are not production
contracts. Report any conflict among the prototype, documentation, approved
requirements or implementation and obtain owner approval before changing the
relevant requirement or reference; never silently redesign the prototype.

Friendly Edition uses locally bundled transparent Cozy Miniatures; the approved
R3 authentication grocery-bag illustration remains unchanged. Light theme is
the baseline; dark theme, haptics and additional animation need later approval.
Do not add a dependency without a technical justification.

Appearance metadata will use stable illustration/color keys with safe legacy
defaults and synchronize for authorized members. List statistics require one
authorized aggregate query, never N+1 item reads. Search is not part of v0.3.
Account avatars use the first email letter; profiles and uploaded avatars are
out of scope. Completed-item collapse is local. Application UI, accessibility
labels, generated messages, identifiers and comments are English; user-entered
content can use any language.

### Non-regression contract

Preserve authentication and session recovery; protected navigation and /lists
cold start; warm/cold deep links and push-notification navigation; Supabase RLS;
React Query cache, invalidation and realtime; offline, reconnect, Retry and
cached-data states; per-entity mutation and duplicate-navigation guards; and
Sentry monitoring. New UI must not claim successful mutation, access or
notification delivery without evidence.

### Completed stages

- [x] **R0 Planning:** approved baseline, architecture decisions and initial
      design system.
- [x] **R1 UI foundation:** `src/theme/{tokens,semantic,listAppearance}.ts` and
      presentational `Button`, `TextField`, `Screen` and `StatePanel`. No screen,
      Router, hook, service, schema or dependency change. Token parity, quality
      checks and accessibility props are verified. Visual and accessibility
      emulator verification occurs during each primitive's first screen
      integration.
- [x] **R2 Navigation & Layout — accepted:** root and protected Stacks suppress
      generated headers; Auth and My Lists own their titles, while List Details
      owns Back and list actions through `ListHeader`. `Screen` applies explicit
      top/bottom safe-area edges without adding a second provider. History-less
      cold deep links to `/lists/[id]` replace to `/lists` on custom or Android
      Back; ordinary navigation preserves Router Back history. Pixel 8 Local
      verification passed for auth/session recovery, CRUD, offline/reconnect,
      headers/safe areas/StatusBar/FAB, ordinary navigation, duplicate-navigation
      protection, and warm/cold List Details deep links including both Back paths.
      Runtime accessibility remains pending.
- [x] **R0–R2 integration and Development checkpoint:** PR #53 integrated the
      work. Development deployment and physical Android regression completed;
      cold-start push navigation was discovered there. PR #54 (`9403267`) added
      the initial fix and PR #55 (`e9dea60`) completed navigation-readiness and
      lifecycle handling. Dev Client regression passed 11/11, lifecycle
      regression 8/8, and the final no-diagnostics smoke test 4/4. Physical
      notification navigation is owner-confirmed; temporary diagnostics are
      removed. Local Release APK testing was intentionally skipped in favor of
      the CI-generated Dev APK on physical Android. The deployed APK commit was
      not independently verified; Production remains untouched. `user.email ||
'Member'` is source-verified, while the missing-email runtime path remains
      untested and non-blocking. Feature and develop branch synchronization was
      complete at this checkpoint.
- [x] **R3 Authentication — accepted:** owner-approved 3D grocery-bag
      illustration, `Screen`, `Button`, `TextField`, `BuildVersionLabel` and
      existing tokens compose the auth screen. Explicit Sign in/Register
      selection preserves auth logic, protected navigation, build label,
      pending/error behavior and credentials. Owner-confirmed visual and
      functional verification passed on Pixel 8 and Pixel 9, including keyboard,
      validation, error handling, registration, sign-in, duplicate submission,
      logout and session restoration. Static checks passed; no dependency or
      backend change; Production remains untouched. Dedicated screen-reader
      testing remains pending.

### Remaining dependency-aware stages

- [ ] **R4 Friendly Edition assets and design system — active:** 21 approved
      PNGs are imported through the typed static `src/theme/illustrations.ts`
      catalog: ten semantic Clean/Cozy pairs plus one shared `no-image.png`
      fallback. A temporary global Clean/Cozy setting uses existing local
      storage only and defaults to Cozy. The authentication illustration remains
      unchanged. Category and greeting art is not yet available and therefore
      uses the common fallback. Final visual owner review remains required.
- [ ] **R5 List appearance and statistics data layer — implementation pending
      owner review:** migration `20261127120000` persists `icon_key` and
      `color_key` with groceries/indigo defaults and CHECK constraints for the
      stable catalogs, including existing lists. Regenerated types expose both
      fields. `get_accessible_list_summaries()` is a security-invoker aggregate
      RPC returning only authorized lists with owner id, current membership role,
      item count and completed-item count in one query. My Lists now uses this
      RPC for All/Mine/Shared and no longer runs a separate membership query.
      Item and membership triggers touch `lists.updated_at`; list and membership
      realtime events invalidate the summary cache. `CreateList` reuses the
      parent mutation, removing its duplicate summary observer. Local database
      migration history and 88 SQL/RLS assertions pass. An isolated
      non-destructive upgrade test applied R5 to pre-R5 fixture data and
      confirmed preservation of auth users, credentials, identities, sessions,
      lists, items, memberships, push tokens, relations, and legacy list
      reads, as well as defaults and RPC/RLS isolation. Local R5 regression
      passed 11/11 cases on Pixel 8 and Pixel 9, covering CRUD, realtime,
      offline, and reconnect behavior. Development deployment remains pending;
      owner review remains required before completion. Keep data/API and UI
      commits separate.
- [ ] **R6 Main screen — partial first visual slice:** implemented dynamic
      greeting, account popup with temporary Clean/Cozy selector and existing
      logout, circular New list action, All/Mine/Shared filters backed by one
      authorized aggregate summary query, friendly fallback cards, and illustrated
      no-lists/no-shared-lists/error/offline states. Progress banner remains
      deferred until R5 provides authorized statistics data. Preserve existing
      navigation guards and functionality. Pixel 8 manual review recorded 19
      passing cases and no failures; this includes Account menu retest,
      OfflineBanner disappearance, selected-filter persistence, filtering,
      offline and reconnect. The membership-refetch error was not reproduced at
      runtime. Offline cold start remains blocked until Release APK verification.
- [ ] **R7 List Details and items UI:** update header/action placement, item
      progress banner, friendly rows, Quick Add and completed section while
      retaining item CRUD and reliability behavior. Do not invent unsupported
      quantity or note data.
- [ ] **R8 Create/Edit List and Sharing UI:** centered list form, appearance
      picker, live preview, role-aware overflow actions and Sharing modal.
      Preserve authorization/membership behavior; do not expose unimplemented
      Leave functionality as operational.
- [ ] **R9 Extended item details:** audit and design quantity/unit/note
      contracts; change database/API only after approval; add preset/custom
      units and More details; verify shared-list synchronization and legacy item
      compatibility.
- [ ] **R10 Sharing improvements:** audit membership management and RLS;
      implement authorized Leave list; confirm owner/member permissions and
      handle access revocation, cache cleanup and navigation cleanup.
- [ ] **R11 Notification improvements:** audit notify-list-members; preserve
      manual Notify; add approved membership/list lifecycle events; prevent
      duplicate and failed-operation notifications; verify authorization,
      recipients, multi-device delivery, navigation and physical devices.
- [ ] **R12 State and accessibility polish:** unify loading, empty, error,
      offline, pending and success presentation; verify accessibility and
      responsive layouts while retaining state handling throughout earlier
      stages.
- [ ] **R13 Final regression and release review:** compare with v0.3 and verify
      auth, navigation, CRUD, sharing, realtime, notifications, offline/reconnect
      and Sentry on applicable emulator and physical devices. Preserve release
      and deployment approvals.

Design references Apple Reminders, AnyList, Bring! and Todoist inform decisions
but never override the approved prototype.

## Reliability and deployment

### Implemented; preserve during redesign

- Startup recovery, timeout/Retry and stored-session race guards.
- Authenticated offline cold start to /lists; reconnect recovery and honest
  no-cache offline states.
- List/detail/item/sharing loading, Retry, error, cached-data and granular
  pending states; same-card duplicate navigation guard.
- Sentry runtime integration/privacy defaults/Dev symbolication; temporary test
  UI removed.
- Quality CI and Ruleset; verified Development manual deployment with Supabase
  CLI 3.3.0 and Temurin JDK 17.

### Pending verification

- Auth failure/Retry, long background, unstable network, Supabase unavailable,
  expired/revoked session and app update with persisted session.
- Dedicated screen-reader testing for R3 Authentication and later redesigns.
- Rapid taps on different cards, concurrent item/member operations and pending
  cleanup after mutation failure. List Details warm/cold deep-link navigation and
  both Back paths are verified on Pixel 8 Local; notification navigation is
  verified on emulator Dev Clients and owner-confirmed on a physical Android
  CI-generated Dev APK.
- Production APK, Production Sentry/source maps, native crash reporting and
  received-event privacy audit. Physical Android coverage is limited to the
  completed Development regression.
- Production deployment, CI-generated APK Sentry delivery/source maps, and
  manual CI/ruleset execution on master.
- The English fallback sender `user.email || 'Member'` is source-verified; its
  missing-email runtime scenario remains a non-blocking verification item.

### Deferred

- Persistent React Query cache/offline-first data.
- Offline mutations: clearly reject or intentionally queue/synchronize; never
  implicitly queue.
- Deployment hardening: guards, concurrency, environments, preflight, signing,
  dynamic artifacts and partial-recovery automation.
- Automated component/provider tests, isolated Supabase pgTAP CI, Expo Doctor
  and Edge Function Deno validation.

## Completion rule

Run pnpm check, test affected release APKs, and record device, build, network
state and outcome. Do not mark Production or physical-device requirements as
complete without independent evidence.
