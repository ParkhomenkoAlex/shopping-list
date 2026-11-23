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
- **Status:** Pending
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
- **Verification:** cold-open a list with data, with no items, and with a forced
  request failure; repeat with slow network, airplane mode, and reconnect.
- **Dependencies:** none.

### LI-02 — List-details error recovery

- **Priority:** P1
- **Status:** Pending
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
- **Verification:** open an existing and a missing list; force ordinary error,
  offline error, slow response, reconnect, and Retry; verify deep-link routing.
- **Dependencies:** LI-01 is not required.

### LI-03 — Sharing Modal error recovery

- **Priority:** P1
- **Status:** Pending
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
- **Verification:** force a member-query failure, Retry in place, then add and
  remove a member under normal and slow networks.
- **Dependencies:** none.

### LI-04 — Per-item pending states

- **Priority:** P1
- **Status:** Pending
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
- **Verification:** under throttled network toggle, edit, and delete one item;
  attempt actions on another item; retry after error and verify realtime update.
- **Dependencies:** LI-01 should be implemented first to make item-state tests
  unambiguous.

## Optional improvements (P2)

### LI-05 — Logout pending state

- **Priority:** P2
- **Status:** Pending
- **Problem:** the logout action has no local pending state; repeated taps can
  start concurrent sign-out requests and failures are only logged to console.
- **Relevant files:** `src/app/(app)/lists/index.tsx`.
- **Proposed implementation:** add local `isSigningOut`, disable the action,
  show concise pending copy, and display a user-friendly failure message.
- **Acceptance criteria:** one sign-out request per user action; no duplicate
  request while pending; a failed sign-out is understandable and retryable.
- **Verification:** throttle/fail sign-out and tap repeatedly; then verify a
  successful sign-out still reaches the unauthenticated route.
- **Dependencies:** none.

### LI-06 — Per-member pending state

- **Priority:** P2
- **Status:** Pending
- **Problem:** removing one member disables all remove controls because the
  modal uses one `isRemovingMember` flag.
- **Relevant files:** `src/components/lists/ListSharingModal.tsx`.
- **Proposed implementation:** track the target member ID and render pending
  feedback only for that row, while preventing a duplicate removal of it.
- **Acceptance criteria:** unrelated member controls remain available; the
  target row is visibly pending; add-member behavior is unchanged.
- **Verification:** remove one member over slow network and interact with a
  different member; verify success and failure paths.
- **Dependencies:** LI-03 is recommended first.

### LI-07 — Duplicate navigation prevention

- **Priority:** P2
- **Status:** Needs Verification
- **Problem:** rapid repeated taps on a list card might push duplicate detail
  routes. This is a hypothesis, not a confirmed defect.
- **Relevant files:** `src/components/lists/ListCard.tsx`,
  `src/app/(app)/lists/index.tsx`.
- **Proposed implementation:** do not change code until reproduced. If it is
  visible in practice, choose the smallest route-level or temporary
  press-locking solution that preserves deep links and normal back navigation.
- **Acceptance criteria:** only after reproduction is confirmed; a rapid tap
  must not create duplicate detail screens or block a legitimate later tap.
- **Verification:** rapidly tap one and multiple cards on a physical/emulated
  Android device, including under slow network; inspect the back stack.
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
- **Status:** Pending
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
    | Rapid repeated taps           | Verify LI-07 before any code change; no duplicate navigation if reproduction is confirmed and fixed.     |
    | Create/edit/delete            | Each operation disables only its relevant control, shows result/error, and preserves existing behavior.  |
    | Item completion toggle        | Only the selected item is pending; other items remain usable.                                            |
    | Sharing Modal                 | Member load Retry works in place; add/remove operations keep their existing feedback.                    |
    | Navigation                    | Lists, list details, back navigation, deep links, and notification paths retain their existing behavior. |

- **Acceptance criteria:** execute the applicable matrix on Android emulator;
  repeat the risk-critical offline/reconnect and navigation cases on a real
  Android device before calling the required work complete.
- **Dependencies:** LI-01 through LI-06 as applicable.

## Recommended implementation order

1. **LI-01** — establish correct mutually-exclusive item query states.
2. **LI-02** and **LI-03** — add targeted recovery paths without changing query
   or navigation architecture.
3. **LI-04** — introduce per-item pending tracking after the item display-state
   logic is stable.
4. Run the required parts of **LI-09** on Android emulator.
5. Consider **LI-05** and **LI-06** as small optional follow-ups.
6. Run **LI-07** only as a manual investigation; implement only if reproduced.
7. Keep **LI-08** deferred until the product chooses offline-mutation semantics.
