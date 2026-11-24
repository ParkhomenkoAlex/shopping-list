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
- [-] Loading state — частично реализован; primary Dev emulator regression
  предварительно пройден, но полный matrix и физические устройства остаются
  pending. Детальный план и evidence: [`docs/LOADING_INDICATORS_PLAN.md`](docs/LOADING_INDICATORS_PLAN.md).
- [-] Error state + Retry — реализованы для основных list/item/sharing flows;
  preliminary Dev emulator verification пройдена, но исчерпывающие failure,
  deep-link/notification и physical-device проверки остаются pending.

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

### Next priority — UI/UX Redesign

- [ ] Pending — начать после initial CI implementation и verification; до любых
      UI changes провести screenshots, reference analysis, audit фактических
      компонентов и Expo Router navigation/headers, затем согласовать visual concept.
- [ ] Pending — проверить root cause технических Expo Router headers (`(app)`,
      `lists/[id]`), nested headers и duplicate Back buttons; не считать причину
      подтверждённой до аудита navigation tree.
- [ ] Pending — Modern Premium Minimalism — только предварительное направление:
      forest/sage green accents, warm neutral backgrounds, clean typography,
      rounded surfaces и restrained effects; это не утверждённый final design.
- [ ] Pending — references: Apple Reminders (typography/minimal navigation/
      checklist), AnyList (grocery organization/collaboration), Bring! (shopping
      engagement/product presentation), Todoist (hierarchy/interactions/polish).
- [ ] Pending — future scope: navigation/headers, theme tokens/shared design
      system, My Lists, List Details, List Items, Create/Add Item, Sharing Modal,
      auth, loading/empty/error/offline states, accessibility, light/dark themes,
      micro-interactions и haptics. Preserve authentication, sharing, realtime,
      loading/retry/offline behavior и navigation reliability.

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

### CI quality gate and manual deployment hardening

- [x] Completed — initial quality CI is configured in `.github/workflows/ci.yml`
      and was verified by PR #49 (initial implementation commit `af3e3fd`): one
      stable `quality` job runs for PRs and pushes to `develop`/`master`, plus
      `workflow_dispatch`; frozen pnpm install, Prettier, ESLint, TypeScript and
      Expo public-config validation remain separate steps with Node 22, pnpm
      10.11.0, cache, minimal permissions, stale-run cancellation and no
      environment credentials. It cannot deploy, build APKs, use emulators or
      upload Sentry artifacts.
- [x] Completed — `typecheck` and aggregate local `check` scripts are
      implemented; pnpm 10.11.0 is pinned in package metadata. CI still uses
      individual workflow steps for readable diagnostics.
- [x] Completed — GitHub CI verification: the `quality` job passed for PR #49;
      an intentionally malformed `ci-test.json` in commit `6ca0082` failed
      Prettier independently of local hooks, blocked merging as a required check,
      and CI passed again after the temporary file was removed.
- [x] Completed — active GitHub Ruleset `Protect develop and master` protects
      `develop` and `master`: PRs are required (0 approvals), GitHub Actions
      status check `quality` is required and branches must be up to date; force
      pushes and deletions are blocked, the bypass list is empty, Merge/Squash/
      Rebase are allowed, and required deployments are disabled. `quality`, not
      the workflow name `CI`, is the configured required status check. Manual
      deployment workflows are not required merge checks.
- [x] Completed — PR #49 was merged into `develop` (merge commit `370e0c9`),
      local `develop` was fast-forwarded to `origin/develop`, and the repository
      owner confirmed a successful automatic post-merge `quality` run. The
      temporary failure fixture remains removed; the intentional failure and
      recovery commits remain as expected history.
- [ ] Pending — optional trigger-scope verification not yet performed: manual
      `workflow_dispatch` execution of CI and CI/ruleset behavior on `master`.
      The deployment and APK workflows are configured as manual-only, but their
      absence from the post-merge run history has not been independently recorded.
- [ ] Deferred — manual deployment hardening, separate from initial CI and still
      manual-only: Linux Sentry auth handling versus macOS Keychain fallback, early
      prerequisite validation before remote changes, partial-deployment recovery,
      Development/Production branch guards, pinned Supabase CLI, permissions and
      concurrency, Production approvals where supported, dynamic artifact naming,
      Java/Android prerequisites, and deployment verification/recovery procedures.
      Confirmed configuration gaps must be separated from runtime failures not yet
      reproduced.
- [ ] Deferred — Expo Doctor, JavaScript/component test infrastructure, local
      isolated Supabase pgTAP CI, investigation of the missing Supabase seed file,
      and Edge Function Deno validation. They are not part of initial quality CI.

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

**Next development priority after initial CI implementation and verification: UI/UX Redesign.**
