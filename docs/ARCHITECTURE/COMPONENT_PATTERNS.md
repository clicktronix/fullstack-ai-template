# Component Patterns

> This document is the **in-repo reference** for Smart/Dumb component patterns in this template. For interactive scaffolding of new components, the `component-creator` skill (installed via the [`react-clean-skills`](https://github.com/clicktronix/react-clean-skills) marketplace) applies the same conventions programmatically. This doc is the rationale; the skill is the executor.

## Philosophy

Components in the application follow the **Smart/Dumb** separation principle through the `composeHooks` pattern. This ensures:

- ✅ Pure presentation components (easy to test)
- ✅ Reusable logic in hooks
- ✅ Composition without prop drilling
- ✅ Type safety

**ВАЖНО:** `composeHooks` обязателен для всех компонентов, содержащих логику (useState, useEffect, useQuery, и т.д.).

## UI Boundaries

Before creating a hook, choose the right layer:

| Concern                                                      | Correct location                 |
| ------------------------------------------------------------ | -------------------------------- |
| View props assembly for one component                        | `Component/lib.ts`               |
| Reusable UI-only logic                                       | `src/ui/hooks/use-*.ts`          |
| TanStack Query, query keys, invalidation, optimistic updates | `src/ui/server-state/<feature>/` |
| Thin direct Server Action wrappers without server-state      | feature-local `actions.ts`       |
| Application orchestration                                    | `src/use-cases/<feature>/`       |

### `Component/lib.ts` may import

- `@/ui/server-state/**`
- `@/ui/hooks/**`
- `@/ui/stores/**`
- `@/domain/**`
- `@/lib/**`
- `./actions`

### `Component/lib.ts` must NOT import

- `@/adapters/inbound/**`
- `@/adapters/outbound/**`
- `@/adapters/api/**`
- `@/adapters/supabase/**`
- `@/adapters/transport/**`
- `@/app/**`

If a component needs server data, it should consume `ui/server-state` hooks. If it needs a thin one-off Server Action call without TanStack Query semantics, add a local `actions.ts` next to the component or hook instead of importing inbound adapters directly.

## Component Structure

```
Component/
├── index.tsx                  # View + Smart component (NO re-exports!)
├── lib.ts                     # Hooks with logic, utilities
├── interfaces.ts              # Types (if > 5 types, extract here)
├── messages.json              # i18n keys (optional)
└── styles.module.css          # Styles (optional)
```

**Critical Rules**:

- ❌ **NO barrel exports** — `index.tsx` should NOT re-export from other files
- ❌ **NO `index.ts`** files for re-exporting components — import directly
- ✅ **Many types?** Create `interfaces.ts` (when > 5 types) to keep files clean
- ✅ Import components directly: `import { UserCard } from '@/ui/components/UserCard'`

**Why no barrel exports?**

- 📦 Increases bundle size
- 🐌 Slows down tree-shaking
- 🔍 Hides direct dependencies
- 🔄 Causes circular dependency issues

---

## composeHooks Pattern

### Принцип работы

`composeHooks` **автоматически проксирует все props** в хук и во View компонент:

```tsx
// Как работает composeHooks внутри:
function ComposedComponent(props) {
  // 1. Props автоматически передаются в хук
  const hookResult = useProps(props)

  // 2. Props + результат хука объединяются и передаются во View
  // Props имеют приоритет над результатом хука
  return <View {...props} {...hookResult} />
}
```

**Важно:**

- Хук получает ВСЕ props автоматически — не нужно явно передавать каждый prop
- Хук должен деструктурировать только те props, которые ему нужны
- Props, переданные в компонент, перезаписывают результат хука (для override)

### Basic Example

```tsx
// Component/index.tsx
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useComponentProps } from './lib'

// 1. Dumb component (pure function)
export type ComponentViewProps = {
  title: string
  count: number
  onIncrement: () => void
}

export function ComponentView({ title, count, onIncrement }: ComponentViewProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>Increment</button>
    </div>
  )
}

// 2. Smart component (logic via hook)
export const Component = composeHooks(ComponentView)(useComponentProps)
```

```tsx
// Component/lib.ts
import { useState } from 'react'

export type ComponentProps = {
  initialTitle?: string
}

// ✅ Хук получает props автоматически — деструктурируем только нужные
export function useComponentProps({ initialTitle = 'Default' }: ComponentProps) {
  const [count, setCount] = useState(0)

  return {
    title: initialTitle,
    count,
    onIncrement: () => setCount((c) => c + 1),
  }
}
```

```tsx
// Usage
import { Component } from './Component'

function App() {
  return <Component initialTitle="My Counter" />
}
```

### Anti-Pattern: Не передавайте все props явно

```tsx
// ❌ BAD: Явная передача всех props в хук
export function useComponentProps(props: ComponentProps) {
  const { user, config, onUpdate, isLoading, error } = props
  // ...
  return { ...props /* дополнительные поля */ }
}

// ✅ GOOD: Деструктурируем только нужные props
export function useComponentProps({ user, config }: ComponentProps) {
  // Остальные props (onUpdate, isLoading, error) проксируются автоматически
  const displayName = getUserDisplayName(user)
  return { displayName }
}
```

---

## Type Organization with `interfaces.ts`

When a component has many types (> 5), extract them to a separate `interfaces.ts` file to keep code clean and organized.

### When to Extract Types

- ✅ Component has > 5 type definitions
- ✅ Types are used across multiple files (index.tsx, lib.ts, tests)
- ✅ Complex type hierarchies with many properties
- ❌ Simple components with 1-3 types — keep in `lib.ts`

### Example: Component with Many Types

```tsx
// Component/interfaces.ts
export type WorkItemCardProps = {
  workItemId: string
  showLabels?: boolean
  onEdit?: (id: string) => void
}

export type WorkItemCardViewProps = {
  title: string
  description: string
  status: WorkItemStatus
  isPriority: boolean
  isLoading: boolean
  onEdit: () => void
  onArchive: () => void
}

export type WorkItemStatus = 'open' | 'in_progress' | 'blocked' | 'done'

export type WorkItemCardConfig = {
  showLabels: boolean
  showActions: boolean
  density: 'compact' | 'comfortable'
}

export type WorkItemCardActions = {
  onEdit: () => void
  onArchive: () => void
  onAssignLabel: () => void
}
```

```tsx
// Component/lib.ts
import { useCallback } from 'react'
import { useWorkItem } from '@/ui/server-state/work-items/queries'
import type { WorkItemCardProps, WorkItemCardViewProps } from './interfaces'

export function useWorkItemCardProps({
  workItemId,
  onEdit,
}: WorkItemCardProps): WorkItemCardViewProps {
  const { data, isLoading } = useWorkItem(workItemId)

  const handleEdit = useCallback(() => {
    onEdit?.(workItemId)
  }, [onEdit, workItemId])

  return {
    title: data?.title ?? '',
    description: data?.description ?? '',
    status: data?.status ?? 'open',
    isPriority: data?.is_priority ?? false,
    isLoading,
    onEdit: handleEdit,
    onArchive: () => console.log('Archive', workItemId),
  }
}
```

```tsx
// Component/index.tsx
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { WorkItemCardProps, WorkItemCardViewProps } from './interfaces'
import { useWorkItemCardProps } from './lib'

export function WorkItemCardView({
  title,
  description,
  status,
  isPriority,
  isLoading,
  onEdit,
  onArchive,
}: WorkItemCardViewProps) {
  // ... render logic
}

export const WorkItemCard = composeHooks<WorkItemCardViewProps, WorkItemCardProps>(
  WorkItemCardView
)(useWorkItemCardProps)
```

**Benefits**:

- 📁 Clean separation of types from logic
- 🔄 Easy to share types across files
- 📖 Better code organization and readability
- 🧪 Simpler to import types in tests

---

## Import Best Practices

### ❌ Avoid Barrel Exports

```tsx
// ❌ BAD: Creating barrel exports
// components/index.ts
export { UserCard } from './UserCard'
export { Avatar } from './Avatar'
export { Button } from './Button'

// ❌ BAD: Importing from barrel
import { UserCard, Avatar } from '@/ui/components'
```

**Why avoid barrel exports?**

- 📦 Webpack/Vite must parse entire barrel file
- 🐌 Prevents tree-shaking optimization
- 🔄 Can cause circular dependencies
- 📈 Increases initial bundle size

## Server-State Guidance

Move code to `src/ui/server-state/<feature>/` if it contains:

- `useQuery`
- `useMutation`
- query key factories
- optimistic cache updates
- query invalidation
- realtime invalidation
- stream cache synchronization

`Component/lib.ts` should stay focused on view-model assembly and interaction wiring.

## Testing and Selectors

### Component tests

- mock `@/ui/server-state/**`
- avoid mocking `@/adapters/inbound/**` from component tests
- assert rendered output and callbacks, not transport mechanics

### E2E selectors

Prefer explicit `data-testid` for:

- modal and drawer triggers
- destructive confirmations
- table filter triggers and filter inputs
- save / create / delete actions
- async controls (`submit`, `cancel`, `refresh`, `history`, `new item`)

### ✅ Import Directly

```tsx
// ✅ GOOD: Direct imports
import { UserCard } from '@/ui/components/UserCard'
import { Avatar } from '@/ui/components/Avatar'
import { Button } from '@/ui/components/Button'
```

**Benefits**:

- ⚡ Faster bundling and tree-shaking
- 🎯 Clear dependency graph
- 🛡️ No circular dependency issues
- 📉 Smaller bundle size

---

## Composition of Multiple Hooks

`composeHooks` supports up to 5 hooks, which are executed sequentially:

```tsx
// Component/index.tsx
export type ComponentViewProps = {
  data: Data[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onSave: () => void
}

export function ComponentView({
  data,
  isLoading,
  selectedId,
  onSelect,
  onSave,
}: ComponentViewProps) {
  // ... render logic
}

export const Component = composeHooks(ComponentView)(
  useComponentData, // Hook 1: data loading
  useComponentSelection, // Hook 2: selection logic
  useComponentActions // Hook 3: actions (save, delete)
)
```

```tsx
// Component/lib.ts

// Hook 1: Data fetching
export function useComponentData() {
  const { data, isLoading } = useQuery({
    queryKey: ['component-data'],
    queryFn: fetchData,
  })

  return { data: data ?? [], isLoading }
}

// Hook 2: Selection logic (uses the result of Hook 1)
export function useComponentSelection({ data }: { data: Data[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Reset selection if the element is deleted
  useEffect(() => {
    if (selectedId && !data.find((item) => item.id === selectedId)) {
      setSelectedId(null)
    }
  }, [data, selectedId])

  return {
    selectedId,
    onSelect: setSelectedId,
  }
}

// Hook 3: Actions (uses the results of Hook 1 and Hook 2)
export function useComponentActions({
  data,
  selectedId,
}: {
  data: Data[]
  selectedId: string | null
}) {
  const { mutate: save } = useMutation({
    mutationFn: saveData,
  })

  return {
    onSave: () => {
      if (selectedId) {
        const item = data.find((d) => d.id === selectedId)
        if (item) save(item)
      }
    },
  }
}
```

**Execution Order:**

1. `useComponentData()` → returns `{ data, isLoading }`
2. `useComponentSelection({ data })` → receives `data`, returns `{ selectedId, onSelect }`
3. `useComponentActions({ data, selectedId })` → receives both, returns `{ onSave }`
4. Everything is combined into props for `ComponentView`

---

## Typing

TypeScript automatically infers types, but you can specify them explicitly:

```tsx
import type { ComponentType } from 'react'

// Type of external props (what the parent passes)
export type ExternalProps = {
  ownerId: string
  status?: WorkItemStatus
}

// Type of View component props (what is needed for rendering)
export type WorkItemsListViewProps = {
  items: WorkItem[]
  isLoading: boolean
  error: string | null
}

// Dumb component
export function WorkItemsListView({ items, isLoading, error }: WorkItemsListViewProps) {
  // ...
}

// Hook accepts ExternalProps, returns WorkItemsListViewProps
export function useWorkItemsListProps({ ownerId, status }: ExternalProps): WorkItemsListViewProps {
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-items', ownerId, status],
    queryFn: () => listWorkItems({ ownerId, status }),
  })

  return {
    items: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
  }
}

// Smart component with explicit generics (MANDATORY when ExternalProps !== ViewProps)
export const WorkItemsList = composeHooks<WorkItemsListViewProps, ExternalProps>(WorkItemsListView)(
  useWorkItemsListProps
)
```

---

## Working with Props

### Passing Props from a Parent

```tsx
// Parent component passes props
;<WorkItemsList ownerId={user.id} status="open" />

// Hook receives these props
function useWorkItemsListProps({ ownerId, status }: ExternalProps) {
  // ...
}
```

### Overriding Props from a Hook

```tsx
// The parent can override the props returned by the hook
<WorkItemsList ownerId={user.id} isLoading={true} />

// If the hook returned isLoading: false, but the parent passed isLoading: true,
// then the View will receive isLoading: true (passed props have priority)
```

### Partial props

```tsx
// The hook can return only a part of the View's props
export function usePartialProps() {
  return {
    title: 'Hello',
    // count and onIncrement must come from the parent or another hook
  }
}

// Usage
;<Component count={5} onIncrement={() => {}} /> // We supplement the rest
```

---

## Usage Patterns

### 1. Simple Presentation Component (без логики)

```tsx
// Component/index.tsx
export type ButtonProps = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

// ✅ Без composeHooks — компонент не содержит логики
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {label}
    </button>
  )
}
```

**Когда использовать:** Компонент не содержит логики (useState, useEffect, useQuery), только рендерит props.

### 2. Component with Local Logic (ОБЯЗАТЕЛЬНО composeHooks)

```tsx
// Component/index.tsx
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useAccordionProps } from './lib'

export function AccordionView({ isOpen, toggle, children }: AccordionViewProps) {
  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <div>{children}</div>}
    </div>
  )
}

export const Accordion = composeHooks(AccordionView)(useAccordionProps)
```

```tsx
// Component/lib.ts
export function useAccordionProps() {
  const [isOpen, setIsOpen] = useState(false)
  return {
    isOpen,
    toggle: () => setIsOpen((prev) => !prev),
  }
}
```

**Когда использовать:** Компонент содержит внутреннюю логику (state, effects). **composeHooks обязателен**.

### 3. Component with API Data (ОБЯЗАТЕЛЬНО composeHooks)

```tsx
// Component/lib.ts
export function useUserListProps() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  })

  return {
    users: data ?? [],
    isLoading,
    error: error?.message ?? null,
  }
}
```

**Когда использовать:** Компонент загружает данные с сервера. **composeHooks обязателен**.

### 4. Component with a Zustand Store (ОБЯЗАТЕЛЬНО composeHooks)

```tsx
// Component/lib.ts
export function useDashboardHeaderProps() {
  const { isFullScreen, toggleFullScreen } = useDashboardUIStore()
  const { widgets } = useDashboardLayoutStore()

  return {
    widgetCount: widgets.length,
    isFullScreen,
    onToggleFullScreen: toggleFullScreen,
  }
}
```

**Когда использовать:** Компонент использует UI-состояние страницы. **composeHooks обязателен**.

### 5. Component with a Global Context (ОБЯЗАТЕЛЬНО composeHooks)

```tsx
// Component/lib.ts
import { useUser } from '@/ui/providers/AuthContext'

export function useHeaderProps() {
  const { user, isAuthenticated } = useUser()

  return {
    userName: user?.name ?? 'Guest',
    avatarUrl: user?.avatarUrl,
    isAuthenticated,
  }
}
```

**Когда использовать:** Компонент использует глобальное состояние (user, theme). **composeHooks обязателен**.

### 6. Combined Component (API + Store + Context) — composeHooks обязателен

```tsx
// Component/lib.ts
import { useUser } from '@/ui/providers/AuthContext'
import { useDashboardUIStore } from '../stores/dashboardUIStore'

export function useDashboardViewProps() {
  const { user } = useUser()
  const { isModalOpen, openModal, closeModal } = useDashboardUIStore()

  const { data: layout } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => dashboardService.getLayout(user!.id),
    enabled: !!user,
  })

  return {
    userName: user?.name ?? 'User',
    widgetCount: layout?.widgets.length ?? 0,
    isModalOpen,
    onOpenModal: openModal,
    onCloseModal: closeModal,
  }
}
```

**Когда использовать:** Компонент использует несколько источников данных. **composeHooks обязателен**.

---

## Performance Optimization

### 1. Memoizing Callbacks

```tsx
import { useCallback } from 'react'

export function useOptimizedProps() {
  const [count, setCount] = useState(0)

  // ✅ Stable reference
  const onIncrement = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  return { count, onIncrement }
}
```

### 2. Memoizing Expensive Computations

```tsx
import { useMemo } from 'react'

export function useChartProps({ data }: { data: DataPoint[] }) {
  // ✅ Calculated only when data changes
  const processedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      average: calculateAverage(point),
    }))
  }, [data])

  return { processedData }
}
```

### 3. React.memo for Dumb Components

```tsx
import { memo } from 'react'

// ✅ Re-renders only when props change
export const ComponentView = memo(function ComponentView({ title, count }: Props) {
  return <div>...</div>
})
```

### 4. Splitting into Subcomponents

```tsx
// ❌ Bad: the whole component re-renders
function Dashboard() {
  const { widgets, selectedId, onSelect } = useDashboardProps()

  return (
    <div>
      {widgets.map((widget) => (
        <Widget
          key={widget.id}
          {...widget}
          isSelected={selectedId === widget.id}
          onSelect={() => onSelect(widget.id)}
        />
      ))}
    </div>
  )
}

// ✅ Good: only selected widgets re-render
function Dashboard() {
  const { widgets } = useDashboardProps()

  return (
    <div>
      {widgets.map((widget) => (
        <WidgetContainer key={widget.id} widgetId={widget.id} />
      ))}
    </div>
  )
}

const WidgetContainer = memo(function WidgetContainer({ widgetId }: { widgetId: string }) {
  const { widget, isSelected, onSelect } = useWidgetProps(widgetId)
  return <Widget {...widget} isSelected={isSelected} onSelect={onSelect} />
})
```

---

## Working with Styles

### CSS Modules

```tsx
// Component/index.tsx
import styles from './styles.module.css'

export function ComponentView({ variant }: { variant: 'primary' | 'secondary' }) {
  return (
    <div className={styles.container}>
      <button className={styles[variant]}>Click</button>
    </div>
  )
}
```

```css
/* Component/styles.module.css */
.container {
  padding: 1rem;
}

.primary {
  background: blue;
  color: white;
}

.secondary {
  background: gray;
  color: black;
}
```

### Conditional Classes

```tsx
import clsx from 'clsx'
import styles from './styles.module.css'

export function ComponentView({ isActive, variant }: Props) {
  return (
    <div className={clsx(styles.container, isActive && styles.active, styles[variant])}>
      Content
    </div>
  )
}
```

### Mantine UI Integration

```tsx
import { Button, Stack } from '@mantine/core'

export function ComponentView({ onSave }: Props) {
  return (
    <Stack gap="md">
      <Button onClick={onSave}>Save</Button>
    </Stack>
  )
}
```

---

## Internationalization

### TranslationText Component (рекомендуемый способ)

`TranslationText` — компонент для локализованного текста, который объединяет `Text` из Mantine с `FormattedMessage` из react-intl:

```tsx
import { TranslationText } from '@/ui/components/TranslationText'
import messages from './messages.json'

// messages.json
// {
//   "title": { "id": "component.title", "defaultMessage": "My Title" },
//   "description": { "id": "component.description", "defaultMessage": "Hello, {name}!" }
// }

export function ComponentView() {
  return (
    <Stack>
      {/* Базовое использование */}
      <TranslationText {...messages.title} />

      {/* С Mantine Text props */}
      <TranslationText {...messages.title} size="lg" fw={600} c="blue" />

      {/* С интерполяцией значений */}
      <TranslationText {...messages.description} values={{ name: 'John' }} />

      {/* С кастомными элементами в values */}
      <TranslationText
        {...messages.terms}
        values={{
          link: (chunks) => <Anchor href="/terms">{chunks}</Anchor>,
        }}
      />
    </Stack>
  )
}
```

**API TranslationText:**

```tsx
type TranslationTextProps = {
  id: string // ID перевода
  defaultMessage: string // Fallback текст
  description?: string // Описание для переводчиков
  values?: TranslationValues // Значения для интерполяции
} & TextProps // Все props из Mantine Text (size, fw, c, ta, и т.д.)
```

**Важно:**

- Всегда используйте `TranslationText` вместо `<Text>{messages.text}</Text>`
- Не используйте `useIntl().formatMessage()` когда можно использовать `TranslationText`
- `TranslationText` рендерится как `<span>` внутри `<Text>`

### messages.json структура

```json
// Component/messages.json
{
  "title": {
    "id": "workItemsPanel.title",
    "defaultMessage": "Work Items"
  },
  "loading": {
    "id": "workItemsPanel.loading",
    "defaultMessage": "Loading work items..."
  },
  "error": {
    "id": "workItemsPanel.error",
    "defaultMessage": "Error: {error}"
  },
  "noData": {
    "id": "workItemsPanel.noData",
    "defaultMessage": "No work items yet"
  }
}
```

### Когда использовать useIntl напрямую

Используйте `useIntl` только когда нужен форматированный текст **не** внутри JSX:

```tsx
import { useIntl } from 'react-intl'

export function useComponentProps() {
  const intl = useIntl()

  // ✅ Для aria-label, placeholder, title атрибутов
  const ariaLabel = intl.formatMessage({ id: 'button.save', defaultMessage: 'Save' })

  // ✅ Для передачи в библиотеки, которые принимают string
  const dialogTitle = intl.formatMessage({
    id: 'workItems.dialogTitle',
    defaultMessage: 'Work item',
  })

  return { ariaLabel, dialogTitle }
}
```

```tsx
// В компоненте
<Button aria-label={ariaLabel}>
  <TranslationText {...messages.save} /> {/* Внутри JSX - TranslationText */}
</Button>
```

---

## useFormatters Hook

`useFormatters` — хук для форматирования чисел и валют с учетом текущей локали:

```tsx
import { useFormatters } from '@/ui/hooks/use-formatters'

export function useStatsProps({ value, change }: StatsProps) {
  const { currency, compactCurrency, percentage, ratio } = useFormatters()

  return {
    displayValue: currency(value), // "$1,234.56" или "1 234,56 ₽"
    displayCompact: compactCurrency(value), // "$1.2M" или "1,2M ₽"
    displayChange: percentage(change), // "15.5%"
    displayRatio: ratio(1.234), // "1.23"
  }
}
```

### Для графиков используйте стабильные форматтеры

```tsx
export function useChartProps() {
  const { compactCurrencyFormatter, ratioFormatter, percentageFormatter } = useFormatters()

  return {
    // ✅ Стабильные ссылки — не вызывают перерендер графика
    valueFormatter: compactCurrencyFormatter,
  }
}

// View компонент
function ChartView({ valueFormatter }: ChartViewProps) {
  return <BarChart valueFormatter={valueFormatter} />
}
```

**Доступные методы:**

| Метод                    | Описание                  | Пример      |
| ------------------------ | ------------------------- | ----------- |
| `currency(value)`        | Полный формат валюты      | `$1,234.56` |
| `compactCurrency(value)` | Компактный формат (B/M/K) | `$1.5B`     |
| `number(value)`          | Число с разделителями     | `1,234,567` |
| `compactNumber(value)`   | Компактное число          | `1.5M`      |
| `ratio(value)`           | Коэффициент               | `1.23`      |
| `percentage(value)`      | Процент                   | `15.5%`     |

---

## Custom Hooks Library

Проект включает набор переиспользуемых хуков для типичных UI-паттернов.

### useModalState

Управление состоянием модальных окон с удобным API.

```typescript
import { useModalState } from '@/ui/hooks/use-modal-state'

// Модальное окно
const modal = useModalState()

// Для нескольких модалок - используйте отдельные вызовы
const editModal = useModalState()
const deleteModal = useModalState()
```

**Пример использования:**

```tsx
export function useSettingsProps() {
  const editModal = useModalState()

  return {
    editModalOpened: editModal.opened,
    onOpenEdit: editModal.open,
    onCloseEdit: editModal.close,
  }
}

export function SettingsView({ editModalOpened, onOpenEdit, onCloseEdit }: ViewProps) {
  return (
    <>
      <Button onClick={onOpenEdit}>Edit Settings</Button>
      <Modal opened={editModalOpened} onClose={onCloseEdit} title="Edit">
        <EditForm onSuccess={onCloseEdit} />
      </Modal>
    </>
  )
}
```

**API:**

| Свойство   | Тип                   | Описание                  |
| ---------- | --------------------- | ------------------------- |
| `opened`   | `boolean`             | Открыто ли модальное окно |
| `open()`   | `() => void`          | Открыть модаль            |
| `close()`  | `() => void`          | Закрыть модаль            |
| `toggle()` | `() => void`          | Переключить состояние     |
| `props`    | `{ opened, onClose }` | Props для spread на Modal |

**Когда использовать:**

- ✅ Управление модальными окнами
- ✅ Диалоги подтверждения
- ✅ Формы добавления/редактирования
- ❌ Глобальная система модалей (используйте Zustand)

---

### useLocalStorage

SSR-safe работа с localStorage с автоматической синхронизацией.

```typescript
import { useLocalStorage, useLocalStorageValue } from '@/ui/hooks/use-local-storage'

// С автосохранением
const [settings, setSettings] = useLocalStorage('app-settings', { theme: 'dark' })

// Только чтение
const initialSettings = useLocalStorageValue('app-settings', {})
```

**Пример использования:**

```tsx
export function useThemeProps() {
  const [preferences, setPreferences] = useLocalStorage('user-prefs', {
    theme: 'dark',
    fontSize: 14,
  })

  const handleThemeChange = useCallback(
    (theme: string) => {
      setPreferences((prev) => ({ ...prev, theme }))
    },
    [setPreferences]
  )

  return {
    theme: preferences.theme,
    onThemeChange: handleThemeChange,
  }
}
```

**Особенности:**

- ✅ Защита от SSR hydration mismatch
- ✅ Функциональные обновления как в useState
- ✅ Автоматическое сохранение при изменении
- ✅ JSON сериализация/десериализация
- ✅ Обработка ошибок (quota, недоступность)

**Когда использовать:**

- ✅ Предпочтения пользователя
- ✅ Кэширование фильтров и настроек UI
- ✅ Состояние, сохраняемое между сессиями
- ❌ Конфиденциальные данные (используйте httpOnly cookies)
- ❌ Большие объемы данных (лимит ~5MB)

---

### useServerActionForm

Интеграция Mantine форм с Next.js Server Actions.

```typescript
import { useServerActionForm } from '@/ui/hooks/server-action-form/use-server-action-form'

const { form, onSubmit, isSubmitting, reset } = useServerActionForm({
  form: { initialValues, validate },
  action: serverAction,
  successMessage: 'Saved successfully',
  onSuccess: (result) => {
    /* ... */
  },
})
```

**Пример использования:**

```tsx
// adapters/inbound/next/server-actions/users.ts
'use server'
export async function updateProfileAction(userId: number, values: ProfileInput) {
  try {
    const user = await api.updateUser(userId, values)
    return { success: true, data: user }
  } catch {
    return { success: false, error: 'Failed to update' }
  }
}

// lib.ts
export function useProfileFormProps({ userId, user }: Props) {
  const { form, onSubmit, isSubmitting } = useServerActionForm({
    form: {
      initialValues: {
        firstName: user.first_name,
        lastName: user.last_name,
      },
      validate: createMantineValidator(ProfileSchema),
    },
    action: (values) => updateProfileAction(userId, values),
    successMessage: 'Profile updated',
    onSuccess: () => router.push('/profile'),
  })

  return { form, onSubmit, isSubmitting }
}

// index.tsx
export function ProfileFormView({ form, onSubmit, isSubmitting }: ViewProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextInput label="First name" {...form.getInputProps('firstName')} />
      <TextInput label="Last name" {...form.getInputProps('lastName')} />
      <Button type="submit" loading={isSubmitting}>
        Save
      </Button>
    </form>
  )
}
```

**Особенности:**

- ✅ useTransition для неблокирующих обновлений
- ✅ Встроенная валидация через Mantine
- ✅ Автоматические уведомления (success/error)
- ✅ Типизированный результат сервера

**Когда использовать:**

- ✅ Формы с серверной обработкой (CRUD)
- ✅ Валидация на клиенте и сервере
- ❌ Загрузка данных с кэшированием/рефетчами (используйте React Query; для SSR — prefetch + HydrationBoundary)
- ❌ Загрузка файлов (используйте FormData напрямую)

---

### useUrlState

Синхронизация состояния с URL параметрами.

```typescript
import { useUrlState, useUrlStateWithStorage } from '@/ui/hooks/use-url-state'

// Базовое использование
const { value, setValue, clear } = useUrlState<string>({ param: 'q' })

// С localStorage fallback
const viewMode = useUrlStateWithStorage({
  param: 'view',
  storageKey: 'work-items-view',
  defaultValue: 'list',
})
```

**Пример использования:**

```tsx
export function useSearchProps() {
  const { value: query, setValue: setQuery } = useUrlState<string>({
    param: 'q',
  })

  const { value: page, setValue: setPage } = useUrlState<number>({
    param: 'page',
    parse: (v) => parseInt(v, 10),
    serialize: (v) => String(v),
  })

  return {
    query: query ?? '',
    page: page ?? 1,
    onQueryChange: setQuery,
    onPageChange: setPage,
  }
}

// С localStorage fallback
export function useDashboardProps() {
  const { value: viewMode } = useUrlState<string>({
    param: 'view',
    fallback: () => localStorage.getItem('work-items-view'),
    onChange: (value) => value && localStorage.setItem('work-items-view', value),
  })

  return { viewMode: viewMode ?? 'list' }
}
```

**API:**

| Опция       | Тип               | Описание                            |
| ----------- | ----------------- | ----------------------------------- |
| `param`     | `string`          | Имя URL параметра                   |
| `parse`     | `(str) => T`      | Парсер строки в тип                 |
| `serialize` | `(val) => string` | Сериализатор типа в строку          |
| `fallback`  | `() => T \| null` | Функция для default значения        |
| `onChange`  | `(val) => void`   | Callback при изменении              |
| `replace`   | `boolean`         | replace вместо push (default: true) |

**Когда использовать:**

- ✅ Фильтры с сохранением в URL (bookmarks, sharing)
- ✅ Пагинация, сортировка, поиск
- ✅ Deep linking
- ❌ Конфиденциальные данные (видны в URL)
- ❌ Большие объемы данных (лимит длины URL)

---

## Reusable UI Patterns

Reusable UI blocks in this template are plain components and hooks, not a separate widget framework. Keep state mapping in `lib.ts`/`use*Props` and render states explicitly in the View:

```tsx
export type WorkItemsPanelViewProps = {
  items: WorkItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function WorkItemsPanelView({ items, isLoading, error, onRetry }: WorkItemsPanelViewProps) {
  if (isLoading) return <TableSkeleton rowCount={5} />
  if (error)
    return <ApiErrorBoundary fallback={<Alert color="red">{error}</Alert>} onRetry={onRetry} />
  if (items.length === 0) return <TableEmptyState message="No work items yet" />

  return <DataTable data={items} columns={columns} keyExtractor={(item) => item.id} />
}
```

Use this approach for dashboards, admin panels, tables, and feature cards:

- prefer local composition over generic HOCs
- keep loading/error/empty states visible in the View contract
- reuse `DataTable`, `TableSkeleton`, `TableEmptyState`, `ApiErrorBoundary`, and feature-local components
- add a new abstraction only after two or more real feature slices need the same behavior

---

## Testing

### Testing a Dumb Component

```tsx
// Component/index.test.tsx
import { render, screen } from '@testing-library/react'
import { ComponentView } from './index'

describe('ComponentView', () => {
  it('renders title and count', () => {
    render(<ComponentView title="Test" count={5} onIncrement={() => {}} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
  })

  it('calls onIncrement when button clicked', () => {
    const onIncrement = jest.fn()
    render(<ComponentView title="Test" count={5} onIncrement={onIncrement} />)

    screen.getByText('Increment').click()
    expect(onIncrement).toHaveBeenCalled()
  })
})
```

### Testing a Hook

```tsx
// Component/lib.test.ts
import { renderHook, act } from '@testing-library/react'
import { useComponentProps } from './lib'

describe('useComponentProps', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useComponentProps())

    expect(result.current.count).toBe(0)

    act(() => {
      result.current.onIncrement()
    })

    expect(result.current.count).toBe(1)
  })
})
```

### Testing a Smart Component (integration)

```tsx
// Component/index.integration.test.tsx
import { render, screen } from '@testing-library/react'
import { Component } from './index'

describe('Component integration', () => {
  it('increments count on button click', () => {
    render(<Component initialTitle="Test" />)

    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    screen.getByText('Increment').click()

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

---

## Best Practices

### ✅ DO

1. **Separate logic and presentation**

   ```tsx
   // View component - a pure function
   export function View(props) {
     return <div>...</div>
   }

   // Logic in a hook
   export function useProps() {
     /* logic */
   }
   ```

2. **Use TypeScript types**

   ```tsx
   export type Props = { title: string; count: number }
   ```

3. **Memoize callbacks**

   ```tsx
   const onClick = useCallback(() => {}, [])
   ```

4. **Isolate styles**
   ```tsx
   import styles from './styles.module.css'
   ```

### ❌ DON'T

1. **Don't mix logic with JSX**

   ```tsx
   // ❌ Bad
   export function Component() {
     const [count, setCount] = useState(0)
     const { data } = useQuery(...)
     // ... 100 lines of logic
     return <div>...</div>
   }
   ```

2. **Don't use inline functions for events**

   ```tsx
   // ❌ Bad
   <button onClick={() => setCount(count + 1)}>

   // ✅ Good
   const onClick = useCallback(() => setCount(c => c + 1), [])
   <button onClick={onClick}>
   ```

3. **Don't create anonymous components**

   ```tsx
   // ❌ Bad
   export default () => <div>...</div>

   // ✅ Good
   export function Component() {
     return <div>...</div>
   }
   ```

4. **Don't use inline styles**

   ```tsx
   // ❌ Bad
   <Text style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>

   // ✅ Good - Use CSS Modules
   <Text className={styles.messageText}>

   // ✅ Good - Use Mantine props
   <Text size="sm" c="dimmed">
   ```

5. **Don't do data transformation in View components**

   ```tsx
   // ❌ Bad - formatting in View
   function MessageView({ message }) {
     const displayContent = useMemo(() => formatContent(message.content), [message.content])
     return <Text>{displayContent}</Text>
   }

   // ✅ Good - formatting in hook, View receives prepared data
   function MessageView({ displayContent }) {
     return <Text>{displayContent}</Text>
   }

   function useMessageProps({ message }) {
     const displayContent = useMemo(() => formatContent(message.content), [message.content])
     return { displayContent }
   }

   // MANDATORY: Use explicit generics when ExternalProps !== ViewProps
   export const Message = composeHooks<MessageViewProps, MessageProps>(MessageView)(useMessageProps)
   ```

6. **Always use explicit generics with composeHooks when props differ**

   ```tsx
   // ❌ Bad - no generics, TypeScript errors
   export const Chart = composeHooks(ChartView)(useChartProps)

   // ❌ Bad - type casting hides errors
   export const Chart = composeHooks(ChartView)(useChartProps) as React.FC<ChartProps>

   // ✅ Good - explicit generics
   export const Chart = composeHooks<ChartViewProps, ChartProps>(ChartView)(useChartProps)
   ```

   **Rule:** When the hook transforms props (ExternalProps → ViewProps), you MUST use
   `composeHooks<ViewProps, ExternalProps>(View)(hook)` with explicit generic types.

---

## Data Formatting

### Formatting Utilities

All formatting functions should be placed in `src/lib/` as pure functions:

```tsx
// lib/format-currency.ts
export function formatCurrency(value: number, options: FormatCurrencyOptions = {}): string {
  const { currency = 'USD', locale = 'en-US', compact = false } = options

  if (compact) {
    return formatCompactCurrency(value, currency, locale)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

// lib/format-content.ts
export function replaceChartPlaceholders(content: string): string {
  return content.replaceAll(CHART_PLACEHOLDER_REGEX, '').trim()
}
```

### Using Formatters in Components

1. **Import formatter in hook** (not in View)
2. **Apply formatting with useMemo** for expensive operations
3. **Pass formatted data to View**

```tsx
// Component/lib.ts
import { replaceChartPlaceholders } from '@/lib/format-content'

export function useMessageProps({ message }: MessageProps): MessageViewProps {
  const displayContent = useMemo(() => replaceChartPlaceholders(message.content), [message.content])

  return { displayContent, isUser: message.role === 'user' }
}

// Component/index.tsx
function MessageView({ displayContent, isUser }: MessageViewProps) {
  return <Text>{displayContent}</Text>
}

export const Message = composeHooks(MessageView)(useMessageProps)
```

### Visualization Value Formatters

For compact numeric visualizations, use reusable formatters from `lib/formatters`:

```tsx
import { formatCompactNumber } from '@/lib/formatters/number'
;<BarChart
  valueFormatter={formatCompactNumber}
  // ...
/>
```

---

**Last updated:** 2026-01-09
**Version:** 2.0.0
