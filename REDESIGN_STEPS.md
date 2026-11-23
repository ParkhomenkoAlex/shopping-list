# Shopping List — UI/UX Roadmap

## План работы

### 1. Основной экран List

- [x] Header
- [x] Название списка
- [x] `Last updated`
- [x] Секция `Active`
- [x] Секция `Finished`
- [x] Кнопка `+`

### 2. Active / Finished

- [x] Разделить активные и завершённые items.
- [x] Завершённый item визуально приглушается.
- [x] После завершения item перемещается в `Finished`.
- [x] Restore возвращает item в `Active`.

### 3. Анимация завершения

- [ ] Нажатие на checkbox.
- [ ] Мягкий визуальный feedback.
- [ ] Item плавно перемещается в `Finished`.
- [ ] При Restore — обратно в `Active`.
- [ ] Анимации короткие и ненавязчивые.

### 4. Swipe Actions

- [ ] `Active` → Complete / Delete.
- [ ] `Finished` → Restore / Delete.
- [ ] Одновременно открыт только один item.
- [ ] После действия swipe закрывается.
- [ ] В обычном состоянии item выглядит чисто, без лишних кнопок.

### 5. Add Item

- [x] Кнопка `+`.
- [x] Удобный input.
- [ ] Автоматический focus.
- [ ] Keyboard-friendly поведение.
- [x] Submit / Cancel.
- [x] Новый item появляется в `Active`.

### 6. List Actions

В меню `⋯`:

- [x] Edit list.
- [x] Sharing.
- [x] Delete list.

Действия над item остаются через swipe, действия над самим List — через `⋯`.

### 7. Members / Sharing

- [x] Открывается через `⋯ → Sharing`.
- [x] Список участников.
- [ ] Имя / email / role.
- [x] Добавление участника.
- [x] Используем уже готовый backend.
- [x] Invitations и transfer ownership пока не делаем.

### 8. Empty / Loading / Error

- [ ] Empty list.
- [x] Нет активных items.
- [x] Есть только Finished items.
- [x] Loading state.
- [ ] Error state + Retry.

### 9. Финальный UI Polish

- [ ] Spacing.
- [ ] Typography.
- [ ] Цвета.
- [ ] Subtle backgrounds.
- [ ] Border radius.
- [ ] Pressed states.
- [ ] Animation timing.
- [ ] Swipe feel.
- [ ] Размеры иконок.
- [ ] Safe areas.
- [ ] Keyboard behavior.
- [ ] Проверка Android / iOS.
- [ ] Привести все модалки к единому визуальному стилю и исправить их UI/UX.

## Phase 10 — App Reliability & Error Monitoring

**Цель:** исключить намеренный blank screen при старте и recoverable failures, сохранить валидную локальную Supabase session, честно показывать offline-состояния и подготовить проверяемый production monitoring.

**Правило статусов:** `[x]` означает реализовано; ручная проверка APK, доставка telemetry и symbolication отмечаются отдельными пунктами `[x]` только при наличии фактического результата.

### 10.1 — Reliable App Startup

- [x] Visible startup loading and recovery screen.
- [x] Safe authentication initialization with explicit `initializing` / `ready` / `error` state.
- [x] Startup timeout and Retry action.
- [x] Guard stale attempts and auth-state races.
- [x] Preserve a valid persisted session on timeout or transient `getSession()` error.
- [x] Keep React Query cache clearing when the authenticated user changes.
- [x] Static validation of the implementation (TypeScript and ESLint).
- [ ] Automated tests for session restoration, timeout, Retry, late results, auth events and unmount. The repository has no test runner; none was added solely for this phase.
- [ ] Manual APK verification of startup-error recovery and Retry after reconnect.

### 10.2 — Error Handling & Recovery

- [x] Global React Error Boundary with user-safe fallback and conditional `reportError` call.
- [x] NetInfo awareness, offline banner and React Query reconnection handling.
- [x] User Retry for failed list queries; bounded retry only for retryable query errors; mutations are not retried automatically.
- [x] Loading, error/retry, confirmed-empty, cached-data and offline-unavailable states for My Lists.
- [x] Prevent temporary list-detail/network errors from redirecting away as if access were denied.
- [x] AppState integration through React Query focus manager; no forced refetch loop.
- [x] Authenticated root route explicitly redirects `(app)/index → /lists`; direct `/lists/[id]` remains intact.
- [x] Remove the invalid `initialRouteName="lists"` configuration that crashed the Release APK.
- [x] Manual Pixel 8 Development Release verification: authenticated online/offline cold start opens My Lists; unavailable offline data is not rendered as an empty list; reconnect reloads data; no unexpected Sign In redirect in the tested scenario.
- [ ] Verify startup timeout/recovery, long background, slow/unstable network, Supabase unavailability, expired/revoked session, deep links and notification navigation on APKs.

**Deferred product questions (not implemented in Phase 10):**

- [ ] Persistent React Query cache / offline-first data access. The current cache is intentionally in-memory only; after offline process restart the UI shows unavailable-data rather than claiming a confirmed empty list.
- [ ] Offline Create List UX. An offline mutation is paused by TanStack Query's default `networkMode: 'online'` and resumes after reconnect; decide separately whether offline creation should be disabled or rejected immediately. No offline queue or local drafts are included here.

### 10.3 — Production Error Monitoring

- [x] Sentry SDK, Expo config plugin and Sentry Metro config are integrated in source.
- [x] Error Boundary and auth-initialization failures call the monitoring wrapper.
- [x] Privacy defaults are configured in source: `sendDefaultPii: false`; user and request data are removed before send; screenshots, view hierarchy, replay and failed-request capture are disabled.
- [x] Privacy-safe startup breadcrumbs are implemented for launch, foreground/background, connectivity and auth initialization/retry states.
- [x] Release/version, build (`dist`) and environment tags are configured in source.
- [ ] Centralized production application logging. The application currently has conditional Sentry breadcrumbs and scattered `console.error`; it has no persistent structured logger or confirmed remote log delivery.
- [x] Development runtime DSN configuration and JavaScript exception delivery: Dev Release APK `SL-Dev-201-v1.0.0.apk` delivered issue `SHOPPING-LIST-1`.
- [ ] Production runtime DSN configuration and supported native crash reporting remain unverified.
- [x] Controlled Dev-only test event and JavaScript symbolication: release `shopping-list@1.0.0`, dist `201`, and original TypeScript frame `src/app/(app)/lists/index.tsx` / `handleSentryDevTest` were verified. The temporary UI trigger was removed after verification.
- [ ] Privacy validation in the received Sentry event remains to be recorded explicitly; source configuration strips user/request data and disables UI captures.
- [x] Development source-map upload and Debug ID symbolication were verified for dist `201`; Production and native debug-symbol upload remain unverified.
- [ ] Private `SENTRY_AUTH_TOKEN` setup must remain build/CI-only. The token must never be an `EXPO_PUBLIC_` variable or committed; local build workflow retrieves it from Keychain or fails before prebuild when upload is required.
- [ ] Decide whether Phase 10 requires a logging abstraction beyond Sentry breadcrumbs and development `console.error` calls.

### 10.4 — Real Device Reliability Testing

- [x] Development Release APK startup tests on the Pixel 8 emulator (online and authenticated offline cold start).
- [x] Offline startup and reconnect recovery on the Pixel 8 emulator.
- [ ] Startup and authentication recovery tests on Android phone #1 and #2.
- [ ] Slow/unstable-network and temporary Supabase-unavailability tests.
- [ ] Background/foreground and token-refresh tests.
- [ ] Development and Production release APK validation, including install-over-existing-session.
- [ ] Deep-link and notification-tap navigation validation.
- [ ] Production error-reporting, privacy validation, and native symbolication.
- [ ] Final regression pass for all detailed scenarios in `docs/PHASE_10_RELIABILITY_TEST_PLAN.md`.

### Phase 10 evidence and closure criteria

- [x] Dev Release APK `SL-Dev-200-v1.0.0.apk`: online launch, signed-out offline cold start, in-memory list visibility during network loss and reconnect recovery were manually verified.
- [x] Confirmed root causes addressed: Expo Router chose `(app)/index` as the authenticated group's default route; React Query cache is process-local and a `[]` fallback made unavailable data appear empty.
- [x] Corrected Development Release APK: authenticated online/offline cold start opened My Lists; reconnect recovered data; the invalid `initialRouteName` crash was absent.
- [ ] Phase 10 may be marked complete only after all remaining 10.1–10.4 checklist items are closed, including Sentry runtime delivery and symbolication verification. The detailed manual scenarios and their results live in `docs/PHASE_10_RELIABILITY_TEST_PLAN.md`.

## Workflow

1. Реализуем один этап.
2. Запускаем приложение.
3. Проверяем на эмуляторе и телефоне.
4. Исправляем UX/UI.
5. Commit.
6. Переходим к следующему этапу.

## Current Phase

**Phase 3 — Анимация завершения**
