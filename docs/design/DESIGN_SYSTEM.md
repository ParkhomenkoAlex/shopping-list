# Soft Indigo v0.3 — Friendly Edition design system

## Scope and source of truth

[prototype.html](prototype.html) is the approved visual and interaction reference
for Soft Indigo v0.3 — Friendly Edition. This document translates the reference
into React Native token and component conventions; it does not replace the
prototype. Product scope, delivery order and acceptance criteria belong to
[REDESIGN_STEPS.md](../../REDESIGN_STEPS.md).

The approved prototype is the visual and interaction reference; explicit
owner-approved product decisions remain authoritative for functionality. The
prototype simulates authentication, data, network states, notifications and
temporary SVG artwork, none of which are production contracts. If the prototype,
documentation, approved requirements or implementation conflict, report it and
obtain owner approval before changing the relevant requirement or reference.
Light theme remains the baseline; dark theme is deferred.

## Foundations

Existing src/theme/tokens.ts and src/theme/semantic.ts remain the source for
implemented values. Future token changes require a visual justification in the
phase that first needs them. Screens use semantic aliases instead of new
hard-coded values.

| Area                        | Current baseline                                                |
| --------------------------- | --------------------------------------------------------------- |
| Screen background / surface | #F6F7FC / #FFFFFF                                               |
| Main / supporting text      | #20243A / #62677E                                               |
| Indigo / selected tint      | #585BD6 / #E6E9FF                                               |
| Success / success tint      | #21866B / #D9F2E8                                               |
| Warning tint / danger       | #FFF1D8 / #C93649                                               |
| Spacing                     | 4, 8, 12, 16, 20, 24, 28, 32, 40                                |
| Touch target                | at least 44 × 44                                                |
| System typography           | 12–30 pt, weights 400/600/700                                   |
| Core radii                  | 10 swatch, 12 control, 14 button, 17–20 card, 23–25 modal/sheet |

Use restrained borders and elevation rather than copying the prototype's outer
phone shadow. React Native shadow and Android elevation are platform-specific.
Focused, disabled and error controls retain stable geometry.

## Friendly Edition illustrations

Friendly Edition uses locally bundled, transparent-background Cozy Miniatures:
cute expressive characters with appropriate eyes, smiles and emotions. Assets
share a consistent perspective, lighting, material treatment and proportions.
The approved bundled authentication grocery-bag illustration remains unchanged.

The following **19 planned assets** are not implemented. Prototype SVGs are
placeholders and must not be shipped as the final asset set:

| Group                 | Stable semantic keys                                           |
| --------------------- | -------------------------------------------------------------- |
| List categories (8)   | groceries, home, favorites, produce, gifts, cafe, travel, work |
| Time of day (4)       | morning, afternoon, evening, night                             |
| Shopping progress (4) | basket-empty, basket-partial, basket-filled, basket-complete   |
| Empty states (3)      | no-lists, no-shared-lists, no-items                            |

src/theme/listAppearance.ts already owns a presentation-only eight-icon Ionicons
catalog and eight semantic colors: indigo, blue, green, teal, purple, pink,
amber, gray. groceries and indigo remain safe fallbacks for unknown or legacy
values. Future persistence stores only stable keys, never image paths or
arbitrary colors. Illustration choice and color choice are independent.

## Component conventions

| Component                | Friendly Edition convention                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header                   | One visible owner per route; no technical labels or duplicate Back controls.                                                                                                      |
| Avatar and account popup | Email initial. Anchored overlay shows email, build/version and Log out; it does not resize content, dismisses on outside press or Android Back, and needs no logout confirmation. |
| Segments                 | Indigo-tint container, white selected surface and selected accessibility state.                                                                                                   |
| List card                | Friendly white rounded card, larger illustration, independent tint, counts, rounded percentage, progress and shared indicator.                                                    |
| Progress                 | Incomplete bars use common Indigo regardless of list appearance; completed bars use success color and a clear completion indicator.                                               |
| Item row                 | Compact completion control, name, optional quantity/unit badge and optional note; edit/delete remain accessible.                                                                  |
| Modal and picker         | Centered create/edit and Sharing modals; eight icon choices, eight independent colors and a live card preview.                                                                    |
| States                   | Skeleton initial loading, illustrated empty states, Retry initial errors, non-blocking refresh error when cached data exists, dedicated no-cache offline state.                   |

Use native Pressable, Modal, Image, TextInput, ScrollView and virtualized lists
where appropriate. Do not introduce a UI library or abstraction before its first
real consumer. Keep screen-specific layouts local. Tokens and presentational UI
primitives, including Button, TextField, Screen and StatePanel, contain no
Supabase, Router, React Query or mutation logic; preserve their existing
contracts and feature hook contracts unless a change is separately approved.
Screen uses the Expo Router safe-area context already supplied by the app;
integrations select edges explicitly to prevent duplicate insets. The 390 × 820
CSS reference is not an implemented token value or fixed native viewport:
support safe areas, keyboard insets, font scaling, reduced motion and small
Android screens. Verify long list names, emails and item notes, plus Android
Back behavior. Do not introduce unrelated dependencies or abstractions.

## Product presentation rules

### Main screen

Show a local-time greeting with a transparent time-of-day illustration, an
email-initial avatar, a functional shopping-progress banner, All / Mine /
Shared filter, and circular New list action. Do not add a redundant Shopping
List/My Lists title, search field or bottom navigation.

All includes every accessible list. Mine includes lists owned by the current
user, including lists shared with others. Shared includes lists owned by another
user and shared with the current user.

Main-screen progress measures **completed lists**, not aggregate completed
items, for the currently selected All, Mine or Shared filter. A list is complete
only if it has at least one item and every item is complete. Empty lists remain
visible but are excluded from aggregation. Hide the progress banner and show the
appropriate empty state when the selected filter has no lists. When it has lists
but all are empty, show neither an artificial completion percentage nor a
success state. Derive progress from current data, synchronize authorized
shared-list changes, and automatically reopen a completed list when an
incomplete item is added or a completed item is unchecked. Keep available data
visible during background refresh and round percentages consistently. Basket
artwork is empty at 0%, partial at 1–49%, filled at 50–99%, and complete with
success treatment at 100%.

### List details and forms

The detail header places Back, list illustration/name/optional description,
Sharing, Notify members and overflow actions in one row. Sharing is outlined
for private lists and filled for shared lists. Notify is disabled with no other
members. Detail progress measures completed **item entries**, not physical
quantities. Use TO BUY and COMPLETED sections, local completed collapse, and
compact Quick Add with expandable More details.

Extended item details are planned, not currently supported data contracts:
required name; optional decimal quantity defaulting to one; optional preset or
custom unit; and optional note. Display quantity/unit compactly and notes only
when present. Do not introduce partial completion.

Create/Edit List uses a centered modal with required name, optional description,
eight illustration choices, eight independent color choices and live preview.
Create is disabled without a name, opens the new list after success, and Edit is
prefilled. Preserve existing validation, authorization and mutation guards.

### Sharing, notifications and states

Sharing is a dedicated header action with a centered role-aware modal. Only
authorized users manage membership. Owner actions are Edit list and Delete list;
member action is Leave list. Delete and Leave require confirmation. Do not
expose Leave as functional before authorization/RLS work is complete. Do not add
Duplicate list, Clear completed or Uncheck all.

Keep manual Notify members. It targets every other authorized participant,
regardless of sender role, never the sender, and preserves verified
unique-recipient and multi-device behavior. Planned automatic events are member
added (added member), member leaves (owner), member removed (removed member),
and shared-list deleted (remaining participants). Ordinary item CRUD and
completion changes do not send automatic pushes. Accessible notification routes
open the list for member-added, manual-notify and member-left events;
removed/deleted events open My Lists. Stale or inaccessible targets resolve
safely.

Retain data during background refresh; use per-entity pending feedback and block
duplicate submissions. Show an OfflineBanner with cached data, a distinct
no-cache offline state, and automatic refresh after reconnect. Never imply that
an unsuccessful mutation was saved. Offline-first persistence and queued
mutations remain deferred.

## Visual review gate

For every slice: approved prototype → React Native implementation → emulator
screenshots → comparison → corrections → owner approval → commit. Visual
acceptance never waives functional, authorization, offline, accessibility or
reliability verification. Application UI strings, accessibility labels,
generated messages, identifiers and comments remain English-only; user content
may use any language.
