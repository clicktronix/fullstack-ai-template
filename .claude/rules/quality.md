---
paths: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
---

# Testing Quick Rules

Auto-loaded when editing test files. For the full strategy (pyramid, commands, patterns by layer, mocking rules, coverage targets, E2E), see [`docs/TESTING/TESTING_STRATEGY.md`](../../docs/TESTING/TESTING_STRATEGY.md).

## Core Invariants

- **Mock `ui/server-state` hooks**, never outbound adapters or Supabase directly
- **Mock `next/navigation`** (`useRouter`, `useSearchParams`) in UI tests that navigate
- **Use `tests/utils/render.tsx`** for Smart components — it wires `QueryClientProvider` + `IntlProvider`
- **Unit tests run with Bun + happy-dom** (`bunfig.toml` preloads `tests/setup.ts`)
- **E2E tests run with Playwright** (`e2e/playwright.config.ts` auto-loads `.env.test`, then `.env.local`)

## Minimal Templates

### Dumb Component (View)

```typescript
import { render, screen } from '@testing-library/react'
import { expect, test } from 'bun:test'
import { ComponentView } from './index'

test('ComponentView renders data', () => {
  render(<ComponentView isLoading={false} data="Test" />)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

### Hook with Server State

```typescript
import { renderHook } from '@testing-library/react'
import { expect, mock, test } from 'bun:test'
import { useMyComponentProps } from './lib'

mock.module('@/ui/server-state/my-feature/queries', () => ({
  useMyFeature: () => ({ data: { title: 'mocked' }, isLoading: false }),
}))

test('useMyComponentProps maps server data to view props', () => {
  const { result } = renderHook(() => useMyComponentProps({ id: '1' }))
  expect(result.current.title).toBe('mocked')
})
```

## Performance Rules (test-adjacent)

These are enforced in component code but commonly regressed when refactoring to pass tests:

```typescript
// ❌ New object every render — breaks memoized children
<Component config={{ theme: 'dark' }} />

// ✅ Stable reference
const config = useMemo(() => ({ theme: 'dark' }), [])
<Component config={config} />
```

```typescript
// ✅ Set sensible TanStack Query cache policies
useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})
```

```typescript
// ✅ Lazy-load heavy components
const HeavyChart = lazy(() => import('@/ui/components/HeavyChart'))
<Suspense fallback={<Skeleton />}><HeavyChart /></Suspense>
```

```typescript
// ✅ Memoize expensive derivations and stable callbacks
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data])
const handleClick = useCallback(() => doSomething(id), [id])
```

See [`TESTING_STRATEGY.md`](../../docs/TESTING/TESTING_STRATEGY.md#patterns-by-layer) for integration and E2E examples.
