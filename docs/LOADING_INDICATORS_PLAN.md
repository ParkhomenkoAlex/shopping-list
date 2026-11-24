# Loading Indicators — implementation plan

Status values: **Pending** — not started; **In Progress** — implementation is
underway; **Completed** — implementation and required verification are complete;
**Deferred** — an explicit product decision is required first; **Needs
Verification** — a potential issue that must be reproduced before code changes.

This plan is the detailed companion to [section 8 of the UI/UX roadmap](../REDESIGN_STEPS.md#8-empty--loading--error). It does not replace the Phase 10 reliability plan. In particular, persistent query caching and offline mutations remain deferred in [Phase 10](../REDESIGN_STEPS.md#102--error-handling--recovery).

## Existing behaviour to preserve

- **Startup and session recovery:** `StartupScreen` has a visible spinner and a
  Retry recovery state. Auth startup does not intentionally render `null`.
- **Sign in and sign up:** `src/app/auth.tsx` disables fields/actions while a
  request is pending, changes the submit label to `Please wait...`, and displays
  a request error.
- **My Lists:** `src/app/(app)/lists/index.tsx` distinguishes initial load,
  offline unavailable data, ordinary error with Retry, confirmed empty data, and
  already cached data.
- **Create/edit controls:** list and item forms disable duplicate submission,
  change their action labels while pending, and display mutation errors. The
  list-sharing add control and notification action already use inline spinners.
- **Deleting a list:** the details screen shows a blocking deletion overlay.
- **Background refresh:** React Query has `staleTime` and `refetchOnReconnect`.
  Current screens use initial-load state rather than `isFetching`, so cached data
  stays visible during a background refetch.

No new Skeleton component, generic LoadingButton, UI library, or additional
full-screen loader is justified by the current audit. Existing React Native
`ActivityIndicator` and the established button patterns are sufficient. Revisit
a shared button abstraction only if future work creates several truly identical
implementations.

## Required improvements (P1)

### LI-01 — ListItems loading, error, and empty states

- **Priority:** P1
- **Status:** Needs Verification
- **Problem:** `ListItems` renders `ActivityIndicator` for `isLoading`, but it
  also renders `No active items.` from the fallback `[]`. Thus initial loading or
  a query failure can look like a confirmed empty list.
- **Relevant files:** `src/components/items/ListItems.tsx`,
  `src/hooks/useListItems.ts`.
- **Proposed implementation:** model initial loading, query error, confirmed
  loaded-empty, and loaded data as mutually exclusive display states. Keep the
  existing ACTIVE and FINISHED grouping. Do not replace data with a spinner when
  cached query data is being refetched in the background.
- **Acceptance criteria:**
    - Initial loading never displays `No active items.`.
    - A failed request never displays an empty-state claim.
    - A successful empty response displays the existing empty copy.
    - Cached active/finished items stay visible through reconnect/refetch.
    - Existing Retry and create/edit/delete flows remain available as appropriate.
- **Verification:** static verification is complete. Preliminary Android Dev
  verification passed for a forced request error, Retry pending feedback, and
  recovery, normal list loading, and offline cached-data preservation. Still
  unverified: the complete initial-loading/empty/slow-network matrix and final
  regression testing.
- **Retry pending-state correction:** the initial implementation left Retry
  active without progress feedback. `useListItems` now exposes its refetching
  state; while Retry is active, the control is disabled and shows the same
  inline `ActivityIndicator` pattern as LI-02 and LI-03. Preliminary Android
  Dev verification passed; exhaustive regression coverage remains pending.
- **Dependencies:** none.

### LI-02 — List-details error recovery

- **Priority:** P1
- **Status:** Needs Verification
- **Problem:** the details route displays a raw query error and has no Retry or
  route-specific offline explanation.
- **Relevant files:** `src/app/(app)/lists/[id].tsx`, `src/hooks/useList.ts`.
- **Proposed implementation:** use the existing `refetchList` return value to
  present a friendly error state and Retry action. Use connectivity state to
  distinguish offline unavailable data from a normal request failure. Preserve
  the existing safe redirect only for a confirmed missing list/permission, not
  for an error.
- **Acceptance criteria:**
    - Technical error messages are not shown directly to users.
    - Retry works without navigating away.
    - Offline does not imply that the list was deleted or inaccessible.
    - Cached list details remain visible during background refetch.
- **Verification:** static implementation is complete. Preliminary Android Dev
  verification passed for a forced request error, Retry, and recovery. Still
  unverified: missing-list and deep-link paths, slow-network behavior, and
  final regression testing.
- **Dependencies:** LI-01 is not required.

### LI-03 — Sharing Modal error recovery

- **Priority:** P1
- **Status:** Needs Verification
- **Problem:** loading shared members shows a spinner and error, but the hook
  does not expose a refetch action; the user must close and reopen the modal to
  retry.
- **Relevant files:** `src/components/lists/ListSharingModal.tsx`,
  `src/hooks/useListMembership.ts`.
- **Proposed implementation:** expose the existing query's `refetch` as a
  named hook API and render an in-modal Retry action for member-load failures.
  Preserve current add/remove behavior and cached member data during refetch.
- **Acceptance criteria:**
    - Failed member loading has a Retry action in the same modal.
    - Retry does not close the modal or clear the pending add-member form.
    - Add/remove member mutation feedback keeps working.
- **Verification:** static implementation is complete. Preliminary Android Dev
  verification passed for the member-load error and recovery. Retry recovery
  while the same Android modal remains open is unverified: that modal blocked
  access to the temporary fault control. Add/remove member behavior under slow
  network and final regression testing also remain unverified.
- **Dependencies:** none.

### LI-04 — Per-item pending states

- **Priority:** P1
- **Status:** Needs Verification
- **Problem:** `useListItems` exposes a single mutation-level `isUpdating` and
  `isDeleting`. Consequently `ListItems` disables every shopping item while one
  item is updated or deleted; the affected row has no precise progress signal.
- **Relevant files:** `src/components/items/ListItems.tsx`,
  `src/components/items/ListItem.tsx`, `src/hooks/useListItems.ts`.
- **Proposed implementation:** retain existing mutations/realtime invalidation,
  but track the pending operation by item ID (for example from mutation
  variables or local operation state). Disable duplicate actions only for the
  affected item and use a small inline existing `ActivityIndicator` there.
- **Acceptance criteria:**
    - Repeated actions on the same pending item are prevented.
    - Other items remain usable while one item saves or deletes.
    - The pending row visibly communicates progress.
    - Errors still associate with the operation without breaking realtime updates.
- **Verification:** static implementation is complete: component-level pending
  operations are keyed by item ID, with a synchronous ref guard against repeated
  presses. `tsc`, ESLint, Prettier, and `git diff --check` must pass. Pending
  manual Android verification: normal toggle, creation, and deletion were
  preliminarily passed on the Dev emulator. Concurrent operations on different
  items, mutation failure/pending-state cleanup, throttled network, and realtime
  update remain unverified.
- **Dependencies:** LI-01 should be implemented first to make item-state tests
  unambiguous.

## Optional improvements (P2)

### LI-05 — Logout pending state

- **Priority:** P2
- **Status:** Needs Verification
- **Problem:** the logout action has no local pending state; repeated taps can
  start concurrent sign-out requests and failures are only logged to console.
- **Relevant files:** `src/app/(app)/lists/index.tsx`.
- **Proposed implementation:** add local `isSigningOut`, disable the action,
  show concise pending copy, and display a user-friendly failure message.
- **Acceptance criteria:** one sign-out request per user action; no duplicate
  request while pending; a failed sign-out is understandable and retryable.
- **Verification:** static implementation is complete: a synchronous ref guards
  rapid presses, the action is disabled while pending, and a generic error is
  rendered after failure. `tsc`, ESLint, Prettier, and `git diff --check` pass.
  Normal logout and subsequent login were preliminarily passed on the Dev
  emulator. A forced sign-out failure, repeated taps while pending, and final
  regression remain unverified.
- **Dependencies:** none.

### LI-06 — Per-member pending state

- **Priority:** P2
- **Status:** Needs Verification
- **Problem:** removing one member disables all remove controls because the
  modal uses one `isRemovingMember` flag.
- **Relevant files:** `src/components/lists/ListSharingModal.tsx`.
- **Proposed implementation:** track the target member ID and render pending
  feedback only for that row, while preventing a duplicate removal of it.
- **Acceptance criteria:** unrelated member controls remain available; the
  target row is visibly pending; add-member behavior is unchanged.
- **Verification:** static implementation is complete: component-level pending
  member IDs permit independent removals while a ref prevents duplicate
  confirmation actions for the same member. `tsc`, ESLint, Prettier, and
  `git diff --check` pass. The Sharing Modal's normal behavior was
  preliminarily passed on the Dev emulator. Concurrent removals, interaction
  with another member during a pending removal, mutation failure/pending-state
  cleanup, and slow-network behavior remain unverified.
- **Dependencies:** LI-03 is recommended first.

### LI-07 — Duplicate navigation prevention

- **Priority:** P2
- **Status:** Completed
- **Problem:** confirmed on the Dev Android emulator: quickly double-tapping
  the same list card pushes the same detail route twice. One Back action then
  reveals the duplicate detail screen instead of returning to My Lists.
- **Relevant files:** `src/components/lists/ListCard.tsx`,
  `src/app/(app)/lists/index.tsx`.
- **Static investigation:** `ListCard` invokes its supplied `onPress` without a
  local lock, and `ListsScreen` calls `router.push` for every press. In the
  installed Expo Router SDK 57, each `router.push` adds a `PUSH` action to the
  routing queue; this path has no application-level deduplication.
- **Implementation:** `ListsScreen` retains `router.push` to preserve existing
  stack semantics. A synchronous `Set<listId>` blocks only repeated pending
  navigation for the same card. Expo Router's `useFocusEffect` clears the set
  whenever My Lists regains focus, so the same card can be opened immediately
  after Back. `router.navigate` was not selected because its existing-route
  semantics could change history behavior for dynamic list routes.
- **Acceptance criteria:** a rapid tap must not create duplicate detail screens
  or block a legitimate later tap after returning to My Lists.
- **Verification:** confirmed on the Dev Android emulator: rapid double and
  multiple taps on the same card open only one details screen, and one Back
  returns to My Lists. Opening a different list normally also works. Rapid
  taps on different cards remain unverified.
- **Dependencies:** manual reproduction is mandatory.

## Deferred product decision

### LI-08 — Offline mutation UX

- **Priority:** P1 product decision
- **Status:** Deferred
- **Problem:** with TanStack Query's default online network mode, an offline
  mutation can remain pending (`Creating...`) and resume after connectivity
  returns. This was already recorded as deferred Phase 10 work.
- **Relevant files:** `src/lib/QueryClient.ts`, list/item/member mutation hooks
  and their forms.
- **Options:**
    - **Option A:** reject or disable offline mutations immediately and explain
      that an internet connection is required.
    - **Option B:** intentionally queue mutations and synchronize after reconnect.
- **Decision boundary:** choose product semantics before implementation. Option
  B requires reliability design beyond loading indicators (ordering,
  persistence, conflicts, cancellation and user feedback).
- **Acceptance criteria / verification:** to be defined after a product choice.
- **Dependencies:** retain the Phase 10 deferral; do not introduce offline
  queueing or persistence through this plan.

## Verification work

### LI-09 — Manual verification matrix

- **Priority:** P1
- **Status:** In Progress
- **Problem:** the proposed UI changes need device-level validation under real
  timing and connectivity conditions.
- **Relevant files:** all files changed by LI-01 through LI-06; detailed
  reliability regressions remain in [the Phase 10 test plan](PHASE_10_RELIABILITY_TEST_PLAN.md).
- **Scenarios and expected outcomes:**

    | Scenario                      | Expected outcome                                                                                         |
    | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
    | Initial loading               | A spinner appears without false empty copy; navigation remains responsive.                               |
    | Successful empty response     | Empty copy appears only after a successful query returns no records.                                     |
    | Loading failure               | A friendly error is shown; no false empty state; Retry is available where specified.                     |
    | Retry after failure           | The same screen/modal recovers without unnecessary navigation or form loss.                              |
    | Offline then reconnect        | Offline data remains honest; cached data remains visible; eligible queries recover after reconnect.      |
    | Slow network                  | Pending controls cannot submit duplicates and clearly identify the affected operation.                   |
    | Background refetch with cache | Existing lists/items/members stay visible; no full-screen flicker.                                       |
    | Rapid repeated taps           | Same-card duplicate navigation is confirmed fixed; rapid taps on different cards remain unverified.      |
    | Create/edit/delete            | Each operation disables only its relevant control, shows result/error, and preserves existing behavior.  |
    | Item completion toggle        | Only the selected item is pending; other items remain usable.                                            |
    | Sharing Modal                 | Member load Retry works in place; add/remove operations keep their existing feedback.                    |
    | Navigation                    | Lists, list details, back navigation, deep links, and notification paths retain their existing behavior. |

- **Confirmed Dev emulator finding:** cached lists remained accessible offline,
  but opening a previously uncached list showed an indefinite spinner while the
  global offline banner was visible. React Query reported the initial query as
  `isPending: true` and `isPaused: true`: `isPending` alone did not mean an
  active fetch. Reconnection loaded the data automatically. The hooks and UI
  now treat a paused initial query without cached data as offline/unavailable
  data; manual retest of list details, items, and sharing remains required.

- **Preliminary Android Dev results:** forced request failures showed the
  LI-01 items error, Retry pending state, and recovery; the LI-02 details error,
  Retry, and recovery; and the LI-03 member-load error and recovery. Cached
  list details, items, and shared members remained visible during a failed
  refetch in these preliminary checks. After the temporary test infrastructure
  was removed, preliminary Dev emulator regression feedback also covered My
  Lists and List Details loading, item toggle/creation/deletion, Sharing Modal,
  same-card duplicate-navigation prevention, logout/login, offline cached data,
  automatic reconnect, and normal operation without fault injection. These
  results do not complete the full regression matrix.

- **Unverified:** LI-03 recovery through Retry without closing the Android
  modal was not verified, because the modal prevented access to the temporary
  test control used to remove the injected failure. The control was removed
  after testing; this path needs a future non-intrusive failure test or another
  suitable manual test method. Also unverified: concurrent per-item/per-member
  operations, mutation-failure pending-state cleanup, rapid taps on different
  cards, deep links and notification navigation regression, and physical-device
  verification.

- **Localization follow-up (out of scope):** loading, error, and action copy is
  currently mixed Russian/English. Consolidating user-facing language is a
  separate product/localization task and is not part of LI-01 through LI-09.

- **Acceptance criteria:** execute the applicable matrix on Android emulator;
  repeat the risk-critical offline/reconnect and navigation cases on a real
  Android device before calling the required work complete.
- **Dependencies:** LI-01 through LI-06 as applicable.

## Recommended implementation order

1. **LI-01** — implemented; Android verification remains pending.
2. **LI-02** and **LI-03** — implemented; Android verification remains
   pending.
3. **LI-04** — implemented; Android verification remains pending.
4. Run the required parts of **LI-09** on Android emulator.
5. **LI-05** and **LI-06** are implemented; Android verification remains
   pending.
6. **LI-07** is complete for repeated taps on the same card; retain the
   unverified rapid-different-card case in final regression testing.
7. Keep **LI-08** deferred until the product chooses offline-mutation semantics.
