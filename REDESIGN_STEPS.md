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
- [-] Loading state — частично реализован; детальный план исправлений и проверок: [`docs/LOADING_INDICATORS_PLAN.md`](docs/LOADING_INDICATORS_PLAN.md).
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

**Статусы:** `[x] Completed` — реализовано и подтверждено доступными проверками; `[-] Partially completed` — реализовано, но покрыта только часть требуемых ручных сценариев; `[ ] Pending` — требует реализации, внешней настройки или фактической проверки.

### 10.1 — Reliable App Startup

- [x] Completed — visible startup loading/recovery screen; explicit `initializing` / `ready` / `error` auth state; timeout, Retry, stale-attempt guards, and persisted-session preservation are implemented.
- [x] Completed — React Query cache is cleared when the authenticated user changes; TypeScript and ESLint have passed.
- [-] Partially completed — Dev APK cold-start scenarios are verified, including persisted authentication; startup-error recovery and Retry after a real failure have not been exercised on an APK.
- [ ] Pending — automated auth-startup tests. The repository has no test runner; none was added solely for this phase.

### 10.2 — Error Handling & Recovery

- [x] Completed — Error Boundary, NetInfo/offline banner, React Query retry/reconnect policy, list loading/error/empty/offline states, and safe list-detail redirect handling are implemented.
- [x] Completed — `(app)/index → /lists` is explicit; the invalid `initialRouteName="lists"` Release crash was removed; direct list routes remain in source.
- [-] Partially completed — Pixel 8 Dev Release verification covered online/offline cold starts, retained session, unavailable-data UI, reconnect, and no unexpected Sign In redirect.
- [ ] Pending — APK verification of timeout/recovery, long background, slow/unstable network, Supabase unavailability, expired/revoked session, deep links, and notification navigation.

**Deferred product questions (not implemented in Phase 10):**

- [ ] Pending / deferred — persistent React Query cache / offline-first data access. The current cache is intentionally in-memory only; after offline process restart the UI shows unavailable-data rather than claiming a confirmed empty list.
- [ ] Pending / deferred — offline Create List UX. An offline mutation is paused by TanStack Query's default `networkMode: 'online'` and resumes after reconnect; decide separately whether offline creation should be disabled or rejected immediately. No offline queue or local drafts are included here.

### 10.3 — Production Error Monitoring

- [x] Completed — Sentry SDK, Expo config plugin, Metro Debug IDs, monitoring wrapper, Error Boundary/auth reporting, lifecycle breadcrumbs, release/dist/environment tags, and privacy defaults are implemented in source.
- [x] Completed — local Dev build workflow supplies release/dist/org/project, retrieves a private token from Keychain or fails before prebuild, and avoids the known Gradle lifecycle token log.
- [x] Completed — Dev APK `SL-Dev-201-v1.0.0.apk` delivered controlled issue `SHOPPING-LIST-1`; release `shopping-list@1.0.0`, dist `201`, uploaded source maps, Debug IDs, and TypeScript symbolication were verified. The temporary trigger was removed.
- [-] Partially completed — privacy controls are implemented, but the received event has not been separately audited and recorded for absence of sensitive fields.
- [-] Partially completed — Sentry breadcrumbs and error reporting provide incident diagnostics, but there is no persistent structured application logger; the product decision whether one is required remains open.
- [ ] Pending — Production runtime DSN delivery, Production source-map verification, native crash/debug-symbol reporting, and CI secret configuration.

### 10.4 — Real Device Reliability Testing

- [x] Completed — Pixel 8 emulator Dev APK online/offline cold starts and reconnect recovery; Dev APK `202` also built, installed, launched, opened My Lists with saved authentication, and no longer contained the temporary Sentry button.
- [-] Partially completed — Dev build/install/start scripts were exercised successfully; this does not validate Production APKs or physical phones.
- [ ] Pending — startup/auth recovery on Android phone #1 and #2; slow/unstable network; Supabase unavailability; background/token refresh; update-over-existing-session; deep links and notification taps.
- [ ] Pending — Production error delivery, privacy event audit, native symbolication, and a final regression pass using `docs/PHASE_10_RELIABILITY_TEST_PLAN.md`.

### Phase 10 evidence and closure criteria

- [x] Completed — Dev APKs `200`, `201`, and `202` supplied the listed startup/offline/reconnect/Sentry/build-workflow evidence.
- [x] Completed — confirmed root causes were addressed: Expo Router's group index selected the former placeholder route; React Query cache is process-local and the former `[]` fallback misrepresented unavailable data as empty.
- [ ] Pending — Phase 10 closure. Production, physical-device, resilience-edge-case, privacy-event, and native-monitoring checks above must be completed or explicitly re-scoped. Detailed scenarios and evidence live in `docs/PHASE_10_RELIABILITY_TEST_PLAN.md`.

## Workflow

1. Реализуем один этап.
2. Запускаем приложение.
3. Проверяем на эмуляторе и телефоне.
4. Исправляем UX/UI.
5. Commit.
6. Переходим к следующему этапу.

## Current Phase

**Phase 10 — App Reliability & Error Monitoring (Partially completed; see closure criteria above)**
