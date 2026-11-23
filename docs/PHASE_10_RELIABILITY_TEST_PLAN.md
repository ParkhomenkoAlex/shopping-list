# Phase 10 — Reliability test plan

## Automated checks

- Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm exec expo config --type public --json >/dev/null` before an APK build. `expo-doctor` is not installed as a project executable, so `pnpm exec expo-doctor` is not a valid command in this repository; run `npx expo-doctor` separately only when that external tool is available.
- The project did not previously include a test runner. Add component/provider tests when Jest or an equivalent test setup is adopted; do not add a second test framework solely for this phase.

## Emulator: Pixel 8

## Required landing behavior

- Authenticated + online: open **My Lists** and load data.
- Authenticated + offline: open **My Lists**, retaining in-memory data when available or showing the offline/unavailable-data state when a process restart removed it.
- Unauthenticated: open Sign In.
- Auth status unavailable after startup timeout/error: show the startup recovery UI with **Повторить**.
- A deep link or notification containing a specific list route must take precedence over the default `/lists` route after auth resolves.
- The obsolete `(app)/index` placeholder must not be an intermediate landing screen for an authenticated cold start.

### Confirmed results from Development Release APK testing

- Passed: the Development Release APK built and installed on the Pixel 8 emulator.
- Passed: authenticated online cold start opened **My Lists** and loaded existing data.
- Passed: authenticated offline cold start opened **My Lists**, kept the authenticated session, and showed the unavailable-data message when no in-memory query data existed.
- Passed: restoring Wi-Fi automatically reloaded lists without navigation or sign-in.
- Passed: the corrected APK no longer threw the `initialRouteName="lists"` startup error.
- Passed: signed-out offline cold start displayed Sign In and the offline banner.
- Passed: Dev Release APK `SL-Dev-201-v1.0.0.apk` on Pixel 8 delivered controlled issue `SHOPPING-LIST-1` to Sentry. The event used release `shopping-list@1.0.0`, dist `201`, and symbolicated to `src/app/(app)/lists/index.tsx` in `handleSentryDevTest`.
- Not yet executed: real-device testing, slow/unstable networks, Supabase unavailability, expired/revoked sessions, app update with persisted session, notification-opening navigation, Production Sentry delivery, and native-crash reporting.

### Reproduced regressions and source fixes

- Reproduced: an authenticated offline process cold start opened the obsolete `(app)/index` placeholder because it was the group's default route, not a persisted last route.
- Reproduced: after that cold start no React Query cache existed; the `data: []` fallback made unavailable list data look like a genuine empty list.
- Fixed in source: `(app)/index` explicitly redirects to `/lists`; list UI distinguishes `hasListsData === false` while offline from a confirmed empty array. React Query persistence was intentionally not added.
- Regression found in the first fix APK: `initialRouteName="lists"` is invalid for this `(app)` Stack. `lists/index.tsx` creates the URL `/lists`, but it is not a screen named `lists` registered in the parent navigator. The invalid prop caused the release startup Error Boundary. It was removed; the explicit index redirect remains the default-landing mechanism.

1. Install the Development APK, sign in, force-stop it, then cold-start: saved session must open **My Lists** without a blank screen or a placeholder-home interaction.
2. Sign out, force-stop, cold-start: the sign-in screen must appear.
3. In a controlled non-production build, force `getSession()` to time out or return an error. The startup recovery UI must be visible; restore the dependency and tap **Повторить**. Airplane mode alone is not an auth-startup failure: a saved session must still open My Lists and no saved session must open Sign In.
4. With a saved session, disable networking, force-stop, and cold-start. My Lists must show the offline/unavailable-data message rather than `No lists yet.`; reconnect and verify automatic loading.
5. Disable networking after lists are loaded. The cached lists must remain visible; reconnect and verify recovery without navigation or logout.
6. Background the app for at least the token-refresh interval, restore connectivity, foreground it, and confirm active stale queries recover.
7. Passed: a temporary Dev-only explicit action called `Sentry.captureException(new Error('Sentry Dev symbolication verification'))` in `ListsScreen`; Dev APK `201` delivered issue `SHOPPING-LIST-1` and symbolicated to the original TypeScript frame. The temporary action was removed immediately after verification. Never use Production for this test.

## Android phone #1 and #2

Repeat the emulator scenarios for both Development and Production APKs, plus:

- start with unstable mobile data;
- simulate temporary Supabase unavailability;
- install a newer APK over an existing session;
- open the app by tapping a notification;
- verify an expired/revoked session only reaches sign-in after a confirmed auth event, never solely because of offline/timeout.

Record APK name, environment, versionCode, device/Android version, network state, result, and Sentry event ID. Do not mark these items complete until executed.

## Sentry setup and source maps

1. Passed: the Sentry React Native project `shopping-list` is configured for Development runtime delivery.
2. Passed: source maps for `shopping-list@1.0.0`, dist `201` were uploaded and symbolicated the controlled Development event.
3. Keep `EXPO_PUBLIC_SENTRY_DSN` only in the appropriate build environment. The DSN is client configuration; never put the private auth token in an `EXPO_PUBLIC_*` variable.
4. The local build scripts provide `SENTRY_ORG=alex-org-e0` and `SENTRY_PROJECT=shopping-list`, retrieve a non-public token from macOS Keychain when needed, and stop before prebuild if upload is enabled but credentials are absent.
5. Before closing Phase 10, repeat delivery/symbolication for Production and verify native crash reporting only if it is in scope.
6. GitHub Actions workflows currently deploy Supabase only; if an APK workflow is added, store the token in GitHub Actions secrets and pass it only to that build step.
