---
paths: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
---

# Testing and Performance

## Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { ComponentView } from './index'

describe('ComponentView', () => {
  it('renders loading state', () => {
    render(<ComponentView isLoading={true} data="" />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders data', () => {
    render(<ComponentView isLoading={false} data="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUser } from './queries'

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ id: 1, name: 'Test' })
  })
})
```

## Performance Guidelines

### Avoid Re-renders

```typescript
// ❌ Bad: Creates new object on every render
<Component config={{ theme: 'dark' }} />

// ✅ Good: Stable reference
const config = useMemo(() => ({ theme: 'dark' }), [])
<Component config={config} />
```

### Optimize TanStack Query

```typescript
// ✅ Set appropriate staleTime
useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000, // Don't refetch for 5 minutes
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
})
```

### Code Splitting

```typescript
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('@/ui/components/HeavyChart'))

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```

### Memoization

```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```
