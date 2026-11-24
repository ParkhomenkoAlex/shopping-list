# Phase 10 — Reliability test plan

Status: **Completed** means manually verified evidence exists; **Partially completed** means only the listed scenarios were verified; **Pending** means the scenario has not been executed.

## Automated checks

- Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm exec expo config --type public --json >/dev/null` before an APK build. `expo-doctor` is not installed as a project executable, so `pnpm exec expo-doctor` is not a valid command in this repository; run `npx expo-doctor` separately only when that external tool is available.
- The project did not previously include a test runner. Add component/provider tests when Jest or an equivalent test setup is adopted; do not add a second test framework solely for this phase.
- **Completed:** the quality-only `CI` workflow and `typecheck`/`check` scripts
  are implemented. On PR #49, the GitHub Actions `quality` job passed; the
  workflow has no deployment, APK, emulator, remote Supabase or Sentry-upload
  steps.
- **Completed:** intentional failure verification. The malformed temporary
  `ci-test.json` in commit `6ca0082` failed Prettier in GitHub CI despite being
  committed with `--no-verify`; the required `quality` check blocked merging.
  Removing the temporary file restored a successful CI result and merge
  availability.
- **Completed:** the active Ruleset `Protect develop and master` requires PRs
  and the GitHub Actions `quality` status check for `develop` and `master`;
  branches must be up to date, force pushes and deletions are blocked, 0
  approvals are required, the bypass list is empty, and deployments are not
  required. `quality`, rather than workflow name `CI`, is the required check.
- **Completed:** PR #49 was merged into `develop` as `370e0c9`; local `develop`
  was fast-forwarded to `origin/develop`, and the repository owner confirmed a
  successful automatic post-merge `quality` run. The temporary failure fixture
  remains removed; the intentional failure and recovery commits remain in
  history as expected.
- **Pending:** manual `workflow_dispatch` CI execution and CI/ruleset behavior
  on `master` have not been verified. Deployment and APK workflows are
  configured as manual-only, but their absence from post-merge run history has
  not been independently confirmed.

## Emulator: Pixel 8

## Required landing behavior

- Authenticated + online: open **My Lists** and load data.
- Authenticated + offline: open **My Lists**, retaining in-memory data when available or showing the offline/unavailable-data state when a process restart removed it.
- Unauthenticated: open Sign In.
- Auth status unavailable after startup timeout/error: show the startup recovery UI with **Повторить**.
- A deep link or notification containing a specific list route must take precedence over the default `/lists` route after auth resolves.
- The obsolete `(app)/index` placeholder must not be an intermediate landing screen for an authenticated cold start.

### Completed — confirmed Development Release APK results

- Passed: the Development Release APK built and installed on the Pixel 8 emulator.
- Passed: authenticated online cold start opened **My Lists** and loaded existing data.
- Passed: authenticated offline cold start opened **My Lists**, kept the authenticated session, and showed the unavailable-data message when no in-memory query data existed.
- Passed: restoring Wi-Fi automatically reloaded lists without navigation or sign-in.
- Passed: the corrected APK no longer threw the `initialRouteName="lists"` startup error.
- Passed: signed-out offline cold start displayed Sign In and the offline banner.
- Passed: Dev Release APK `SL-Dev-201-v1.0.0.apk` on Pixel 8 delivered controlled issue `SHOPPING-LIST-1` to Sentry. The event used release `shopping-list@1.0.0`, dist `201`, and symbolicated to `src/app/(app)/lists/index.tsx` in `handleSentryDevTest`.
- Passed: Dev Release APK `SL-Dev-202-v1.0.0.apk` built, installed, and launched on Pixel 8; saved authentication opened My Lists and the temporary Sentry test control was absent.

### Partially completed — scope covered by the Dev APK results

- Dev emulator evidence covers normal startup, selected offline/reconnect cases, one controlled JavaScript Sentry event, and build/install/start workflow only.
- It does not prove Production behavior, native crash reporting, physical-device behavior, or every resilience scenario.

### Pending — manual scenarios

- Real-device testing, slow/unstable networks, Supabase unavailability, expired/revoked sessions, app update with persisted session, notification-opening navigation, Production Sentry delivery, native-crash reporting, and an explicit received-event privacy audit.

### Reproduced regressions and source fixes

- Reproduced: an authenticated offline process cold start opened the obsolete `(app)/index` placeholder because it was the group's default route, not a persisted last route.
- Reproduced: after that cold start no React Query cache existed; the `data: []` fallback made unavailable list data look like a genuine empty list.
- Fixed in source: `(app)/index` explicitly redirects to `/lists`; list UI distinguishes `hasListsData === false` while offline from a confirmed empty array. React Query persistence was intentionally not added.
- Regression found in the first fix APK: `initialRouteName="lists"` is invalid for this `(app)` Stack. `lists/index.tsx` creates the URL `/lists`, but it is not a screen named `lists` registered in the parent navigator. The invalid prop caused the release startup Error Boundary. It was removed; the explicit index redirect remains the default-landing mechanism.

1. **Completed:** install the Development APK, sign in, force-stop, and cold-start. Saved session opened **My Lists** without a blank screen or placeholder-home interaction.
2. **Completed:** sign out, force-stop, and cold-start. Sign In and the offline banner were verified in the tested offline scenario.
3. **Pending:** force `getSession()` to time out or return an error in a controlled non-production build. The startup recovery UI must be visible; restore the dependency and tap **Повторить**. Airplane mode alone is not an auth-startup failure: a saved session must still open My Lists and no saved session must open Sign In.
4. **Completed:** with a saved session, disable networking, force-stop, and cold-start. My Lists showed unavailable data rather than `No lists yet.`; reconnect reloaded lists.
5. **Completed:** disable networking after lists load. Existing lists remained visible and reconnect recovered without navigation or logout.
6. **Pending:** background the app for at least the token-refresh interval, restore connectivity, foreground it, and confirm active stale queries recover.
7. **Completed:** a temporary Dev-only explicit action called `Sentry.captureException(new Error('Sentry Dev symbolication verification'))` in `ListsScreen`; Dev APK `201` delivered issue `SHOPPING-LIST-1` and symbolicated to the original TypeScript frame. The temporary action was removed immediately after verification. Never use Production for this test.

## Android phone #1 and #2

**Pending:** repeat the emulator scenarios on both Android phones and Production APKs, plus:

- start with unstable mobile data;
- simulate temporary Supabase unavailability;
- install a newer APK over an existing session;
- open the app by tapping a notification;
- verify an expired/revoked session only reaches sign-in after a confirmed auth event, never solely because of offline/timeout.

Record APK name, environment, versionCode, device/Android version, network state, result, and Sentry event ID. Do not mark these items complete until executed.

## Sentry setup and source maps

1. **Completed:** the Sentry React Native project `shopping-list` is configured for Development runtime delivery.
2. **Completed:** source maps for `shopping-list@1.0.0`, dist `201` were uploaded and symbolicated the controlled Development event.
3. **Completed in source:** `EXPO_PUBLIC_SENTRY_DSN` is runtime client configuration; private auth tokens are not `EXPO_PUBLIC_*` values. The monitoring code disables PII, screenshots, view hierarchy, replay, and failed-request capture.
4. **Completed locally:** build scripts provide `SENTRY_ORG=alex-org-e0` and `SENTRY_PROJECT=shopping-list`, retrieve a non-public token from macOS Keychain when needed, and stop before prebuild if upload is enabled but credentials are absent.
5. **Pending:** record an explicit privacy review of a received event, repeat delivery/symbolication for Production, and verify native crash reporting if it is in scope.
6. **Deferred / separate manual-deployment hardening:** existing
   `workflow_dispatch` workflows attempt both Supabase migration/Edge Function
   deployment and APK build/upload. They are not automatic CI. Before relying
   on GitHub-hosted Linux APK builds, address Sentry authentication, early
   prerequisite validation and partial-deployment recovery; any required token
   remains a GitHub secret. The initial quality CI workflow must not build APKs
   or upload Sentry artifacts.
