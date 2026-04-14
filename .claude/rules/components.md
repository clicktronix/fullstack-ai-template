---
paths: ['src/ui/**/*', 'src/app/**/*']
---

# Component Patterns

## Smart/Dumb Pattern with composeHooks

```typescript
// Component/index.tsx
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { TranslationText } from '@/ui/components/TranslationText'
import messages from './messages.json'
import type { UserInfoViewProps } from './lib'

// Dumb component (pure presentation)
export function UserInfoView({ displayName, isLoading }: UserInfoViewProps) {
  if (isLoading) return <Skeleton height={40} />

  return (
    <Card>
      <TranslationText {...messages.nameLabel} size="lg" fw={600} />
      <Text>{displayName}</Text>
    </Card>
  )
}

// Composed component
export const UserInfo = composeHooks<UserInfoViewProps, UserInfoProps>(
  UserInfoView
)(useUserInfoProps)
```

```typescript
// Component/lib.ts
import type { User } from '@/domain/user'
import { getUserFullName } from '@/domain/user'
import { useWorkItems } from '@/ui/server-state/work-items/queries'
import type { UserInfoProps, UserInfoViewProps } from './interfaces'

export function useUserInfoProps({ userId }: UserInfoProps): UserInfoViewProps {
  const { data, isLoading } = useWorkItems()
  const user = data?.items.find((item) => item.id === userId)

  return {
    displayName: user ? getUserFullName(user) : '',
    isLoading,
  }
}
```

```typescript
// Component/interfaces.ts (if many types)
export type UserInfoProps = {
  userId: number
}

export type UserInfoViewProps = {
  displayName: string
  isLoading: boolean
}
```

**Note**: Create `interfaces.ts` when component has > 5 types to keep files clean

````

**Rules**:
- ✅ Use `composeHooks` for Smart/Dumb separation
- ✅ All text via `<TranslationText {...messages.key} />`
- ✅ Dumb components receive only primitive props + callbacks
- ✅ Smart hooks contain business logic, formatters, mappers
- ✅ Helper functions go in `lib.ts` next to the component
- ✅ **Prefer Mantine components** — `Box`, `Stack`, `Group`, `Text`, `Button`, etc.
- ✅ **Use Mantine color props** — `c="blue.6"`, `bg="dark.7"`, NOT hex colors
- ❌ No hardcoded strings in components
- ❌ No business logic in View components
- ❌ No inline `style={{}}` — use Mantine props or CSS Modules
- ❌ No `utils/` folders — put helpers in component's `lib.ts`
- ⚠️ **Avoid raw HTML** — prefer Mantine components.
  - ✅ Exception: minimal wrappers for scrolling/layout interop and `dangerouslySetInnerHTML` rendering are allowed when Mantine equivalents are impractical.

## Creating a New Component

1. **Create folder structure**:
   ```bash
   mkdir -p src/ui/components/ComponentName
   touch src/ui/components/ComponentName/{index.tsx,lib.ts,messages.json}
   # Add interfaces.ts only if many types (> 5)
   touch src/ui/components/ComponentName/interfaces.ts  # optional
   touch src/ui/components/ComponentName/styles.module.css  # optional
````

2. **Define types**:
   - **Few types (< 5)**: Keep in `lib.ts`
   - **Many types (> 5)**: Extract to `interfaces.ts`

   ```typescript
   // interfaces.ts (if many types)
   export type ComponentProps = { userId: number }
   export type ComponentViewProps = { data: string; isLoading: boolean }
   // ... more types
   ```

3. **Create hook in `lib.ts`**:

   ```typescript
   // If few types
   export type ComponentProps = { userId: number }
   export type ComponentViewProps = { data: string; isLoading: boolean }
   export function useComponentProps(props: ComponentProps): ComponentViewProps { ... }

   // If many types
   import type { ComponentProps, ComponentViewProps } from './interfaces'
   export function useComponentProps(props: ComponentProps): ComponentViewProps { ... }
   ```

4. **Create dumb component in `index.tsx`**:

   ```typescript
   // DO NOT re-export anything here! Only component implementation.
   import type { ComponentViewProps } from './lib'  // or './interfaces'

   export function ComponentView(props: ComponentViewProps) { ... }
   export const Component = composeHooks<ComponentViewProps, ComponentProps>(
     ComponentView
   )(useComponentProps)
   ```

5. **Add translations in `messages.json`**:

   ```json
   {
     "title": { "id": "component.title", "defaultMessage": "Title" },
     "description": { "id": "component.description", "defaultMessage": "Description" }
   }
   ```

6. **Import component**:

   ```typescript
   // ✅ Good: Direct import
   import { Component } from '@/ui/components/ComponentName'

   // ❌ Bad: Barrel export
   // DO NOT create components/index.ts with re-exports!
   ```

## Internationalization

**messages.json**:

```json
{
  "greeting": {
    "id": "user.greeting",
    "defaultMessage": "Hello, {name}!"
  }
}
```

**Component usage**:

```typescript
import messages from './messages.json'

// Simple text
<TranslationText {...messages.greeting} />

// With values
<TranslationText
  {...messages.greeting}
  values={{ name: user.name }}
  size="lg"
  fw={600}
/>
```

**Also acceptable**: `useIntl().formatMessage(messages.key)` for placeholders/aria-labels and other string-only props.

## Server Components vs Client Components

### Use Server Components for:

- Static pages (home, about)
- SEO-critical pages
- Data fetching with `fetch()` and cache
- Forms with Server Actions

### Use Client Components for:

- Interactive widgets
- Real-time data with React Query
- Dashboard components
- Forms with optimistic updates

### Protected Routes

```typescript
// app/(protected)/dashboard/page.tsx
import { requireAuth } from '@/infrastructure/auth/require-auth'

export default async function DashboardPage() {
  const session = await requireAuth() // Redirects if not authenticated

  return <DashboardView userId={session.user_id} />
}
```

## Code Splitting

```typescript
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('@/ui/components/HeavyChart'))

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```
