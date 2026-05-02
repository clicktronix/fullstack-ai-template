---
paths:
  [
    'src/use-cases/**/*',
    'src/ui/server-state/**/*',
    'src/ui/hooks/**/*',
    'src/ui/widgets/store/**/*',
    'src/ui/providers/**/*',
  ]
---

# State Management

This project uses a hybrid clean architecture. State placement rules must respect:

```text
app/ui -> ui/server-state|feature-local actions.ts -> inbound adapters -> use-cases -> outbound adapters -> domain
```

## State Decision Tree

| State Type       | Tool                    | Location           | Example                    |
| ---------------- | ----------------------- | ------------------ | -------------------------- |
| **Server State** | TanStack Query          | `ui/server-state/` | User data, work items      |
| **Global State** | React Context           | `ui/providers/`    | User, theme, locale        |
| **Form State**   | Mantine Forms + Valibot | Component-local    | Edit forms, filters        |
| **Component UI** | useState/useReducer     | Component-local    | Modals, dropdowns, toggles |
| **Page UI**      | useState/useReducer     | Feature-local hook | Filters, tabs, layout mode |

## Server State (TanStack Query)

Use for feature-level server data fetching and caching.

Important:

- React Query hooks are feature-local integration code
- they may call inbound adapters or safe feature fetchers
- UI must not call outbound adapters directly

## Direct Server Actions (`actions.ts`)

Use feature-local `actions.ts` files for thin wrappers around Server Actions when the UI needs a direct action call without TanStack Query semantics.

Examples:

- blur-time uniqueness checks
- shared form helpers that submit through a Server Action

Do not put query keys, optimistic updates, or cache invalidation there.

**Query**:

```typescript
import { useWorkItems } from '@/ui/server-state/work-items/queries'

const { data, isLoading, error } = useWorkItems()
```

**Mutation**:

```typescript
import { useUpdateWorkItem } from '@/ui/server-state/work-items/mutations'

const updateWorkItem = useUpdateWorkItem()

updateWorkItem.mutate({ id: '1', input: { title: 'Refine onboarding' } })
```

## Global State (React Context)

Use for app-wide state that doesn't come from API.

**Examples**: User session, theme preference, locale.

```typescript
import { useAuth } from '@/ui/providers/AuthContext'

const { user, isAuthenticated } = useAuth()
```

## Component UI State (useState)

Use for component-local UI state.

**Examples**: Modal open/close, dropdown expanded, selected tab.

```typescript
const [isOpen, setIsOpen] = useState(false)
```

## When to Use What

| Need                  | Use                                                 |
| --------------------- | --------------------------------------------------- |
| Fetch server data     | `useQuery()` in `ui/server-state/*/queries.ts`      |
| Mutate server data    | `useMutation()` in `ui/server-state/*/mutations.ts` |
| Global user/theme     | React Context                                       |
| Page UI state         | Feature-local `useState` / `useReducer` hook        |
| Form state            | Mantine Forms                                       |
| Component local state | useState                                            |
