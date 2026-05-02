# Component Patterns

> This document is the **in-repo reference** for Server/Client component patterns in this template. For interactive scaffolding of new components, the `react-component-creator` skill (installed via the [`nextjs-clean-skills`](https://github.com/clicktronix/nextjs-clean-skills) marketplace) applies the same conventions programmatically. This doc is the rationale; the skill is the executor.

## Philosophy

Components in the application follow the **Smart/Dumb** separation principle through the `composeHooks` pattern. This ensures:

- ✅ Pure presentation components (easy to test)
- ✅ Reusable logic in hooks
- ✅ Composition without prop drilling
- ✅ Type safety

**IMPORTANT:** `composeHooks` is required for every component that contains logic (useState, useEffect, useQuery, and so on).

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

### How It Works

`composeHooks` **automatically proxies all props** into the hook and the View component:

```tsx
// How composeHooks works internally:
function ComposedComponent(props) {
  // 1. Props are automatically passed into the hook.
  const hookResult = useProps(props)

  // 2. Props and the hook result are merged and passed into View.
  // Props take precedence over the hook result.
  return <View {...props} {...hookResult} />
}
```

**Important:**

- The hook receives ALL props automatically, so you do not need to pass each prop manually
- The hook should destructure only the props it needs
- Props passed to the component override the hook result when an override is needed

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

// ✅ The hook receives props automatically, so destructure only what it needs.
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

### Anti-Pattern: Do Not Pass Every Prop Manually

```tsx
// ❌ BAD: Manually passing all props into the hook.
export function useComponentProps(props: ComponentProps) {
  const { user, config, onUpdate, isLoading, error } = props
  // ...
  return { ...props /* additional fields */ }
}

// ✅ GOOD: Destructure only the props that are needed.
export function useComponentProps({ user, config }: ComponentProps) {
  // The remaining props (onUpdate, isLoading, error) are proxied automatically.
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

### 1. Simple Presentation Component (No Logic)

```tsx
// Component/index.tsx
export type ButtonProps = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

// ✅ No composeHooks, because the component contains no logic.
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {label}
    </button>
  )
}
```

**When to use:** The component has no logic (useState, useEffect, useQuery) and only renders props.

### 2. Component with Local Logic (composeHooks Required)

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

**When to use:** The component contains internal logic (state, effects). **composeHooks is required**.

### 3. Component with API Data (composeHooks Required)

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

**When to use:** The component loads server data. **composeHooks is required**.

### 4. Component with Page-Local State (composeHooks Required)

```tsx
// Component/lib.ts
export function useDashboardHeaderProps() {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])

  return {
    widgetCount: widgets.length,
    isFullScreen,
    onToggleFullScreen: () => setIsFullScreen((value) => !value),
    onWidgetsChange: setWidgets,
  }
}
```

**When to use:** The component uses page UI state. Keep that state near the feature segment; add a dedicated store only after a real shared state model appears. **composeHooks is required**.

### 5. Component with a Global Context (composeHooks Required)

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

**When to use:** The component uses global state (user, theme). **composeHooks is required**.

### 6. Combined Component (API + Local State + Context) — composeHooks Required

```tsx
// Component/lib.ts
import { useUser } from '@/ui/providers/AuthContext'

export function useDashboardViewProps() {
  const { user } = useUser()
  const [isModalOpen, setModalOpen] = useState(false)

  const { data: layout } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => dashboardService.getLayout(user!.id),
    enabled: !!user,
  })

  return {
    userName: user?.name ?? 'User',
    widgetCount: layout?.widgets.length ?? 0,
    isModalOpen,
    onOpenModal: () => setModalOpen(true),
    onCloseModal: () => setModalOpen(false),
  }
}
```

**When to use:** The component uses several data sources. **composeHooks is required**.

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

### Locale detection

The app resolves locale in this order:

1. `localStorage`
2. Locale cookie (`LOCALE_COOKIE_NAME`)
3. Default locale (`en`)

`src/proxy.ts` persists the detected locale cookie from `Accept-Language` on the first request. `LocaleProvider` reads that cookie on mount if localStorage does not already contain a user preference.

Do not read `cookies()` or `headers()` in the root layout just to set locale: with Cache Components, request-time APIs must be inside a `Suspense` boundary. If a product needs fully localized HTML on the first byte, model locale as a route segment or do a dedicated i18n migration.

### TranslationText Component (Recommended)

`TranslationText` is a localized text component that combines Mantine `Text` with react-intl `FormattedMessage`:

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
      {/* Basic usage */}
      <TranslationText {...messages.title} />

      {/* With Mantine Text props */}
      <TranslationText {...messages.title} size="lg" fw={600} c="blue" />

      {/* With interpolated values */}
      <TranslationText {...messages.description} values={{ name: 'John' }} />

      {/* With custom elements in values */}
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
  id: string // Translation ID
  defaultMessage: string // Fallback text
  description?: string // Description for translators
  values?: TranslationValues // Values for interpolation
} & TextProps // All Mantine Text props (size, fw, c, ta, and so on)
```

**Important:**

- Always use `TranslationText` instead of `<Text>{messages.text}</Text>`
- Do not use `useIntl().formatMessage()` when `TranslationText` is enough
- `TranslationText` renders as a `<span>` inside `<Text>`

### messages.json Structure

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

### When to Use useIntl Directly

Use `useIntl` only when formatted text is needed **outside** JSX:

```tsx
import { useIntl } from 'react-intl'

export function useComponentProps() {
  const intl = useIntl()

  // ✅ For aria-label, placeholder, and title attributes.
  const ariaLabel = intl.formatMessage({ id: 'button.save', defaultMessage: 'Save' })

  // ✅ For passing text into libraries that accept strings.
  const dialogTitle = intl.formatMessage({
    id: 'workItems.dialogTitle',
    defaultMessage: 'Work item',
  })

  return { ariaLabel, dialogTitle }
}
```

```tsx
// In the component
<Button aria-label={ariaLabel}>
  <TranslationText {...messages.save} /> {/* Inside JSX, use TranslationText */}
</Button>
```

---

## useFormatters Hook

`useFormatters` is a hook for formatting numbers and currencies according to the current locale:

```tsx
import { useFormatters } from '@/ui/hooks/use-formatters'

export function useStatsProps({ value, change }: StatsProps) {
  const { currency, compactCurrency, percentage, ratio } = useFormatters()

  return {
    displayValue: currency(value), // "$1,234.56" or "1 234,56 RUB"
    displayCompact: compactCurrency(value), // "$1.2M" or "1.2M RUB"
    displayChange: percentage(change), // "15.5%"
    displayRatio: ratio(1.234), // "1.23"
  }
}
```

### Use Stable Formatters for Charts

```tsx
export function useChartProps() {
  const { compactCurrencyFormatter, ratioFormatter, percentageFormatter } = useFormatters()

  return {
    // ✅ Stable references do not rerender the chart.
    valueFormatter: compactCurrencyFormatter,
  }
}

// View component
function ChartView({ valueFormatter }: ChartViewProps) {
  return <BarChart valueFormatter={valueFormatter} />
}
```

**Available methods:**

| Method                   | Description            | Example     |
| ------------------------ | ---------------------- | ----------- |
| `currency(value)`        | Full currency format   | `$1,234.56` |
| `compactCurrency(value)` | Compact format (B/M/K) | `$1.5B`     |
| `number(value)`          | Grouped number         | `1,234,567` |
| `compactNumber(value)`   | Compact number         | `1.5M`      |
| `ratio(value)`           | Ratio                  | `1.23`      |
| `percentage(value)`      | Percentage             | `15.5%`     |

---

## Custom Hooks Library

The project includes only small reusable hooks that are already used in the template. Do not add a generic UI-library surface in advance: if a hook is needed by only one feature, keep it next to that feature in `_internal/`.

### Local Modal State

For regular modals, use local state or Mantine `useDisclosure`. For URL-addressable modals, use the parallel/intercepting routes described below.

```typescript
import { useDisclosure } from '@mantine/hooks'

const [opened, handlers] = useDisclosure(false)
```

**Usage example:**

```tsx
export function useSettingsProps() {
  const [editModalOpened, editModal] = useDisclosure(false)

  return {
    editModalOpened,
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

**When to use:**

- ✅ Modal state management
- ✅ Confirmation dialogs
- ✅ Create/edit forms
- ❌ URL-addressable detail modal (use `@modal` + an intercepting route)

---

### Browser Storage

For small browser-only preferences, use `src/lib/storage.ts`. Do not read `localStorage` in Server Components.

```typescript
import { createStorageAccessor } from '@/lib/storage'

const workItemsViewStorage = createStorageAccessor({
  key: 'work-items-view',
  defaultValue: 'list' as const,
})
```

**Usage example:**

```tsx
export function useThemeProps() {
  const [theme, setTheme] = useState(() => workItemsViewStorage.load())

  const handleThemeChange = useCallback((theme: string) => {
    setTheme(theme)
    workItemsViewStorage.save(theme)
  }, [])

  return {
    theme,
    onThemeChange: handleThemeChange,
  }
}
```

**Features:**

- ✅ Protection from SSR hydration mismatch
- ✅ Functional updates like useState
- ✅ JSON serialization/deserialization
- ✅ Error handling for quota and unavailable storage

**When to use:**

- ✅ User preferences
- ✅ Filter and UI settings caching
- ✅ State persisted between sessions
- ❌ Sensitive data (use httpOnly cookies)
- ❌ Large data volumes (about 5 MB limit)

---

### useServerActionForm

Mantine form integration with Next.js Server Actions.

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

**Usage example:**

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

**Features:**

- ✅ useTransition for non-blocking updates
- ✅ Built-in validation through Mantine
- ✅ Automatic success/error notifications
- ✅ Typed server result

**When to use:**

- ✅ Forms with server-side CRUD handling
- ✅ Client and server validation
- ❌ Data loading with caching/refetches (use React Query; for SSR, use prefetch + HydrationBoundary)
- ❌ File uploads (use FormData directly)

---

### Progressive Forms with `useActionState`

Login/signup and other no-JS-critical forms should use React 19 `useActionState` with a real form action. Keep the Server Action wrapper feature-local, then delegate into the inbound adapter.

```tsx
// _internal/ui/LoginForm/actions.ts
'use server'

export async function submitLoginForm(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const result = await signInAction({
    email: getFormString(formData, 'email'),
    password: getFormString(formData, 'password'),
  })

  redirect(getPostLoginRedirect(formData))
}
```

```tsx
// _internal/ui/LoginForm/lib.ts
const [state, formAction, isSubmitting] = useActionState(submitLoginForm, initialLoginFormState)
```

```tsx
// _internal/ui/LoginForm/index.tsx
export function LoginFormView({ formAction, isSubmitting, error }: LoginFormViewProps) {
  return (
    <form action={formAction}>
      <FormErrorAlert error={error} />
      <FloatingTextInput name="email" autoComplete="email" />
      <FloatingPasswordInput name="password" autoComplete="current-password" />
      <Button type="submit" loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  )
}
```

Use this pattern when the form must submit before client JavaScript hydrates. Use `useServerActionForm` for already-client-side CRUD forms that need Mantine client validation and notifications.

---

### URL State

For shareable filters and pagination, keep canonical state in the URL. In Server Components, accept `searchParams`; in Client Components, use `useSearchParams()` + `router.replace()` inside a feature-local hook when interactive synchronization is needed.

```typescript
export default async function WorkItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  return <WorkItemsDashboard initialQuery={params.q ?? ''} />
}
```

**Usage example:**

```tsx
export function useSearchProps() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''

  const setQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    router.replace(`${pathname}?${next.toString()}`)
  }

  return {
    query,
    onQueryChange: setQuery,
  }
}
```

**When to use:**

- ✅ Filters persisted in the URL (bookmarks, sharing)
- ✅ Pagination, sorting, search
- ✅ Deep linking
- ❌ Sensitive data (visible in the URL)
- ❌ Large data volumes (URL length limits)

---

## Route Modal Pattern

Use App Router parallel routes plus intercepting routes when a detail view should open as a modal on soft navigation and remain a full page on hard navigation.

Canonical structure:

```text
src/app/(protected)/admin/
├── @modal/
│   ├── default.tsx
│   └── (.)work-items/[id]/page.tsx
├── layout.tsx
└── work-items/[id]/page.tsx
```

Rules:

- `@modal/default.tsx` must exist and return `null`; it is the fallback for unmatched modal slot state.
- `layout.tsx` must accept and render `{ modal }` next to `{ children }`.
- `@modal/(.)work-items/[id]/page.tsx` is for soft navigation from `/admin/work-items` to `/admin/work-items/[id]`.
- `work-items/[id]/page.tsx` is the hard-navigation/full-page equivalent.
- Put a `Suspense` boundary around dynamic modal content, because `params` and request-time data are dynamic with Cache Components.

The live example is `src/app/(protected)/admin/@modal/(.)work-items/[id]/page.tsx` and `src/app/(protected)/admin/work-items/[id]/page.tsx`.

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
  if (isLoading) return <Loader />
  if (error)
    return <ApiErrorBoundary fallback={<Alert color="red">{error}</Alert>} onRetry={onRetry} />
  if (items.length === 0) return <Text c="dimmed">No work items yet</Text>

  return <WorkItemsList items={items} />
}
```

Use this approach for dashboards, admin panels, tables, and feature cards:

- prefer local composition over generic HOCs
- keep loading/error/empty states visible in the View contract
- reuse small primitives such as `ApiErrorBoundary`, `SectionCard`, `SectionHeader`, and feature-local components
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
