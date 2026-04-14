---
paths: ['src/domain/**/*', 'src/adapters/**/*', 'src/use-cases/**/*', 'src/app/**/*', 'src/ui/**/*']
---

# Hybrid Clean Architecture

## Dependency Flow

```text
app/ui -> ui/server-state|feature-local actions.ts -> inbound adapters -> use-cases -> outbound adapters -> domain
```

The project is a full-stack Next.js app, so `app/` is part of the architecture as a framework layer, not just a frontend shell.

## 1. Domain Layer (`src/domain/`)

**Purpose**: Pure business entities and rules.

**Rules**:

- ❌ No React or Next.js
- ❌ No Supabase or API calls
- ❌ No app/ui/use-cases/adapters imports
- ❌ Do NOT use `import * as v from 'valibot'`
- ❌ No config constants (`DEFAULT_*`)
- ✅ Pure Valibot schemas and utility functions
- ✅ File naming in kebab-case where needed

## 2. Use-Cases Layer (`src/use-cases/`)

**Purpose**: Application scenarios.

Recommended feature structure:

```text
use-cases/work-items/
├── work-items.ts
├── ports.ts
└── types.ts
```

```text
ui/server-state/work-items/
├── queries.ts
├── mutations.ts
└── keys.ts
```

**Rules**:

- ✅ Use-case files implement application scenarios
- ✅ May depend on `domain`, `infrastructure`, and outbound adapters
- ❌ No `'use server'`
- ❌ No `NextRequest`, `NextResponse`
- ❌ No `revalidatePath`, `revalidateTag`
- ❌ No direct UI imports
- ❌ No inbound adapter imports

## 2a. Server-State Integration (`src/ui/server-state/`)

**Purpose**: React Query keys, hooks, auth-gated query wrappers, realtime invalidation.

**Rules**:

- ✅ May depend on inbound adapters
- ✅ May depend on domain, use-cases, and client-safe outbound helpers (auth/realtime)
- ❌ No `app/` imports
- ❌ No presentation imports from `ui/components`, `ui/providers`, `ui/contexts`, `ui/stores`
- ❌ No business orchestration that belongs in use-cases

## 2b. Feature-Local UI Actions (`actions.ts`)

**Purpose**: Thin wrappers around Server Actions when UI needs a direct action call without TanStack Query semantics.

**Rules**:

- ✅ May depend on inbound adapters
- ✅ May be called from component hooks and shared UI hooks
- ❌ No query keys, cache invalidation, or optimistic updates
- ❌ No `app/` imports
- ❌ No presentation imports from `ui/components`, `ui/providers`, `ui/contexts`, `ui/stores`
- ✅ Keep them next to the component or hook that uses them

## 3. Inbound Adapters (`src/adapters/inbound/next/`)

**Purpose**: Framework-facing entry adapters.

Examples:

- Server Actions
- route-handler logic
- request / form-data mapping
- auth context acquisition
- cache invalidation

**Rules**:

- ✅ Can depend on use-cases
- ✅ Can wire outbound dependencies into use-cases
- ✅ May use `'use server'`, `NextRequest`, `NextResponse`, `revalidatePath`, `revalidateTag`
- ❌ Should not hold business rules

## 4. Outbound Adapters (`src/adapters/outbound/`)

**Purpose**: Infrastructure implementations.

Examples:

- Supabase repositories
- external API clients
- transport/SSE helpers

**Rules**:

- ✅ Can depend on domain
- ❌ Must not depend on UI
- ❌ Must not depend on `app/`
- ❌ Must not depend on inbound adapters
- ❌ Must not embed page-specific logic

## 5. `app/` and `ui/`

### `src/app/`

**Purpose**: Next.js filesystem entrypoints only.

Contains:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `route.ts`

Rules:

- keep files thin
- delegate route logic to inbound adapters
- do not call outbound adapters directly

### `src/ui/`

**Purpose**: Presentation.

Rules:

- may depend on domain and use-cases
- must not import outbound adapters directly

## 6. Infrastructure (`src/infrastructure/`)

**Purpose**: Shared technical support.

Contains:

- auth plumbing
- i18n
- logging
- config helpers
- common error mapping

Infrastructure supports the use-case layer but is not the business core.

## Practical Guidance

### Correct

```typescript
// UI -> use-case integration
import { useWorkItems } from '@/ui/server-state/work-items/queries'

// Server Action -> use-case
import { createWorkItem } from '@/use-cases/work-items/work-items'

// Use-case -> outbound adapter
import { createSupabaseWorkItemRepository } from '@/adapters/outbound/supabase/work-items.repository'
```

### Incorrect

```typescript
// ❌ UI -> outbound adapter
import { listWorkItems } from '@/adapters/outbound/supabase/work-items.operations'

// ❌ use-case -> inbound adapter
import { createWorkItemAction } from '@/adapters/inbound/next/server-actions/work-items'

// ❌ domain -> app/ui
import { getHeaderTabs } from '@/ui/components/Header/HeaderNavigation'
```
