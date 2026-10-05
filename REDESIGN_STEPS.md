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

- [x] Rename / Edit
- [x] Members / Sharing
- [x] Delete

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

## Workflow

1. Реализуем один этап.
2. Запускаем приложение.
3. Проверяем на эмуляторе и телефоне.
4. Исправляем UX/UI.
5. Commit.
6. Переходим к следующему этапу.

## Current Phase

**Phase 3 — Анимация завершения**
