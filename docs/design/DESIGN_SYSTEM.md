# Soft Indigo v0.2 — Design System

## Статус и источник истины

`prototype.html` — утверждённый визуальный baseline Soft Indigo v0.2. Этот
документ переводит его значения в React Native tokens; он не заменяет prototype.
При расхождении между ними сначала обновляется и утверждается prototype, затем
React Native реализация.

Implementation phases, product decisions and acceptance criteria live in
[`REDESIGN_STEPS.md`](../../REDESIGN_STEPS.md). This document owns only visual
tokens, component presentation and React Native rendering conventions.

## Foundations

### Цвета

| Token                   | Значение    | Назначение                                                    |
| ----------------------- | ----------- | ------------------------------------------------------------- |
| `color.canvas`          | `#E9EAF3`   | внешний демонстрационный canvas; не обязательный экранный фон |
| `color.background`      | `#F6F7FC`   | основной фон экранов                                          |
| `color.surface`         | `#FFFFFF`   | карточки, dialog и sheet                                      |
| `color.text.primary`    | `#20243A`   | заголовки и основной текст                                    |
| `color.text.secondary`  | `#62677E`   | описания и supporting text                                    |
| `color.text.muted`      | `#74788D`   | completed text и метаданные                                   |
| `color.border`          | `#E8E9F1`   | границы карточек и header/footer                              |
| `color.border.strong`   | `#DCDFEA`   | поля ввода и выбор в picker                                   |
| `color.border.subtle`   | `#EFF0F5`   | разделители rows                                              |
| `color.primary`         | `#585BD6`   | primary action, focus, progress, checkbox                     |
| `color.primary.strong`  | `#4548B8`   | selected text / stronger emphasis                             |
| `color.primary.subtle`  | `#E6E9FF`   | selected surfaces, icon backgrounds, segments                 |
| `color.warning.surface` | `#FFF1D8`   | offline/notice surface                                        |
| `color.danger`          | `#C93649`   | destructive action                                            |
| `color.scrim`           | `#20243A66` | sheet/dialog overlay                                          |

Семантические состояния должны ссылаться на tokens, а не на hex в экранных
компонентах: `feedback.error`, `feedback.warning`, `feedback.success`,
`control.disabled`, `focus.ring`. Их точные success/disabled оттенки нужно
утвердить на первом визуальном проходе: prototype задаёт warning и danger, но не
задаёт полноценную semantic success scale.

### Palette для списков

Каталог не хранит hex в базе. У stable `colorKey` есть пара foreground/tint:

| `colorKey` | Accent    | Tint      |
| ---------- | --------- | --------- |
| `indigo`   | `#585BD6` | `#E6E9FF` |
| `blue`     | `#3979C6` | `#DCEAFF` |
| `green`    | `#21866B` | `#D9F2E8` |
| `teal`     | `#298BA8` | `#DDF1F8` |
| `purple`   | `#9061C6` | `#EDE1FC` |
| `pink`     | `#C65C91` | `#F9E0ED` |
| `amber`    | `#D18A25` | `#FFF0D5` |
| `gray`     | `#6B7280` | `#E9EAF0` |

### Typography

Используется platform system font: custom font не утверждён и не нужен на первой
итерации. Prototype использует 12, 13, 16, 21, 25 и 30 pt. В RN используются
`fontWeight` `400`, `600`, `700` (CSS `650` отображается как ближайший доступный
вес):

| Role                 | Size / line height | Weight                        |
| -------------------- | ------------------ | ----------------------------- |
| Screen title         | 30 / 36            | 700                           |
| Sheet title          | 21 / 28            | 700                           |
| Dialog/account title | 25 / 32            | 700                           |
| Body / input         | 16 / 22            | 400                           |
| Button / label       | 16 / 22            | 600                           |
| Section label        | 13 / 18            | 700, letter spacing `0.5–0.8` |
| Supporting/meta      | 12–13 / 18         | 400–600                       |

### Layout, radius и elevation

Base spacing scale: `4, 8, 12, 16, 20, 24, 28, 32, 40`. Минимальный target для
touch control — 44×44. Основные радиусы: 10 (swatch), 12 (input/secondary), 14
(primary/button/icon), 17 (card), 24 (auth logo), 25 (bottom sheet top). Радиус
38 относится только к макету телефона и не переносится в приложение.

Prototype использует `0 20 55 #25263822` для оболочки телефона. В приложении
этот внешний shadow не нужен; для surface применяются очень сдержанные iOS
`shadow*` и Android `elevation`, либо только border. Не пытаться копировать CSS
box-shadow буквально: Android elevation и iOS shadow имеют разные модели.

## Components

| Component          | Варианты / контракт                                                                 |
| ------------------ | ----------------------------------------------------------------------------------- |
| `Button`           | primary, secondary, destructive, icon; busy/disabled state, `accessibilityState`    |
| `TextField`        | label, placeholder, focused, disabled, validation/error; 13 px label, 16 px value   |
| `SegmentedControl` | auth Sign in/Register; selected surface + subtle shadow                             |
| `IconTile`         | 44×44 tinted list icon; icon 24                                                     |
| `ListCard`         | icon, name, `total · completed`, percentage, 5 px progress; pressed state           |
| `ShoppingItemRow`  | 24 px circular checkbox, compact content, item-only pending indicator and actions   |
| `ProgressBar`      | 5 px, rounded, accessible progress value                                            |
| `Sheet` / `Dialog` | scrim, 25 px top radius for sheet, close affordance, safe-area + keyboard aware     |
| `IconColorPicker`  | catalog grid (4 columns), selected 2 px primary border, color circles, live preview |
| `StatePanel`       | loading, empty, offline and retryable error; never hides cached usable data         |

## Interaction and system states

- Pressed: native `Pressable` pressed opacity/background; no arbitrary animation
  framework in the first pass.
- Focus: use a primary border without changing input geometry; preserve visible
  keyboard focus where the platform supplies it.
- Disabled: visual opacity plus real `disabled`/`accessibilityState`; a pending
  mutation blocks only its own entity.
- Loading/refetch: initial empty-data load uses a bounded indicator; cached data
  stays visible for background refetch.
- Offline: use the existing `OfflineBanner`, NetInfo and query-paused state;
  never replace cached content with a false empty state.
- Error: user-safe text and existing Retry path, never raw Supabase error.

## React Native implementation architecture

R1 implements only the foundation below; other primitives appear only with their
first consumer:

```text
src/theme/
  tokens.ts        # raw palette, spacing, radii, typography
  semantic.ts      # light semantic aliases; no dark theme commitment yet
  listAppearance.ts# iconKey/colorKey catalog and display mapping
src/components/ui/
  Button.tsx, TextField.tsx, Screen.tsx, StatePanel.tsx
```

Keep screen-specific layout styles local. Tokens and UI primitives must not hold
Supabase, Router, React Query or mutation logic. Existing feature components keep
their hook contracts; the redesign changes composition and styles incrementally.
`Screen` uses the installed `react-native-safe-area-context`; R2 must inspect the
existing Expo Router safe-area context before deciding whether a root provider is
needed when the primitive is integrated into navigation.

## HTML-to-native differences

- CSS layout is a 390×820 visual reference, not a fixed RN viewport. Use
  `SafeAreaView`, flex layout, `ScrollView`/`FlatList`, dynamic type and keyboard
  insets.
- `box-shadow`, `:focus-visible`, CSS animations and bottom-fixed DOM controls
  require platform-specific RN equivalents.
- Prototype SVG paths are reference artwork. Do not add `react-native-svg` only
  for the auth illustration. Используется dedicated bundled graphic asset,
  сохраняющий утверждённый внешний вид grocery illustration.
- Native `Modal` accessibility, Android back dismissal and keyboard behavior
  must be explicitly tested; CSS overlay behavior is not sufficient.

## Visual review gate

For each implemented slice: prototype reference → RN implementation → emulator
screenshots at the same state → side-by-side comparison → corrections → owner
approval → commit. A visual match never waives functional, offline, accessibility
or reliability verification.
