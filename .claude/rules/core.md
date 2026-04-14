---
paths:
  ['src/**/*', 'middleware.ts', 'next.config.ts', 'eslint.config.mjs', 'scripts/**/*', 'tests/**/*']
---

# Frontend Core Rules

**CRITICAL**: Always respond in Russian (Русский язык) when working on this project.

## Critical Constraints

### TypeScript & Code Style

- ❌ No `interface` — use `type`
- ❌ No classes — functional only
  - ✅ Exception: TypeScript module augmentation (`declare module ... { interface ... }`) is allowed where required by upstream typings (e.g. Mantine).
  - ✅ Exception: Error types may use classes in `src/lib/errors/*` (extending `Error`) for ergonomics and `instanceof` checks.
- ❌ No `any` types
- ❌ Do NOT use `import * as v from 'valibot'` — import functions directly
- ❌ **No barrel exports** — Never create `index.ts` just for re-exporting
- ❌ **No trailing slashes in API URLs** — use `/api/v1/users/123` NOT `/api/v1/users/123/`

### UI & Styling (ОБЯЗАТЕЛЬНО!)

- ❌ **No inline `style={{}}`** — use Mantine props or CSS Modules
- ❌ **No hardcoded hex colors** — ТОЛЬКО:
  - Mantine CSS vars: `var(--mantine-color-blue-6)`
  - Palette imports: `import { darkColorScales } from '@/ui/themes/palette-dark'`
  - Mantine props: `c="blue.6"`, `bg="dark.7"`
  - ✅ Exception: palette definition files (`src/ui/themes/palette-*.ts`) may contain hex colors as source tokens.
- ❌ **No custom HTML elements for UI** — use Mantine components:
  - `<div>` → `<Box>`, `<Stack>`, `<Group>`, `<Flex>`
  - `<button>` → `<Button>`, `<ActionIcon>`
  - `<input>` → `<TextInput>`, `<NumberInput>`, `<Select>`
  - `<span>` для текста → `<Text>`, `<Title>`
- ❌ No hardcoded strings — always use `<TranslationText {...messages.key} />`
  - ✅ Exception: `src/app/global-error.tsx` and other root-level fallback pages may use hardcoded strings if `IntlProvider` is not available. Add a short comment explaining why.

### Architecture

- ✅ Import domain types from `@/domain/entity`
- ✅ Use `composeHooks` for Smart/Dumb separation
- ✅ Dark theme is default (`defaultColorScheme="dark"`)
- ✅ **Many types?** Extract to `interfaces.ts` file

## Dependency Flow

```text
app/ui -> inbound adapters -> use-cases -> outbound adapters -> domain
```

**Rules**:

- `app/` is a framework layer with thin entrypoints only
- Server Actions and route-handler logic are inbound adapters
- `ui/` must not import outbound adapters directly
- `use-cases/` must not use `'use server'`, `NextRequest`, `NextResponse`, `revalidatePath`, `revalidateTag`
- `domain/` depends on nothing except domain

## File Naming Reference

| Type               | Convention                | Example                                                     |
| ------------------ | ------------------------- | ----------------------------------------------------------- |
| Domain files       | kebab-case                | `work-item.ts`, `balance-sheet.ts`                          |
| Domain main module | `index.ts`                | `domain/user/index.ts`                                      |
| Components         | PascalCase folders        | `UserCard/`, `DashboardView/`                               |
| Component files    | index/lib/messages/styles | `index.tsx`, `lib.ts`, `messages.json`, `styles.module.css` |
| Hooks (custom)     | camelCase                 | `useUser()`, `useFormatters()`                              |
| Utility files      | kebab-case                | `create-mantine-validator.ts`                               |
| Types              | PascalCase                | `type User`, `type Portfolio`                               |
| Inferred types     | From schemas              | `type User = InferOutput<typeof UserSchema>`                |

## Component Structure

```
Component/
├── index.tsx          # View + composeHooks (NO re-exports!)
├── lib.ts             # Hook, business logic, mappers
├── interfaces.ts      # Types (create if > 5 types)
├── messages.json      # i18n translations
└── styles.module.css  # Component styles (optional)
```

**Rules**:

- ❌ Do NOT use `index.tsx` for barrel exports (re-exporting from other files)
- ✅ `index.tsx` contains ONLY the component implementation
- ✅ If component has many types (> 5), extract to `interfaces.ts`
- ✅ Import directly: `import { UserCard } from '@/ui/components/UserCard/index'`

## Common Pitfalls

### ❌ Don't: Use barrel exports

```typescript
// ❌ Bad: index.ts as barrel export
// components/index.ts
export { UserCard } from './UserCard'
export { Avatar } from './Avatar'

// ❌ Bad: importing from barrel
import { UserCard } from '@/ui/components'

// ✅ Good: import directly from file
import { UserCard } from '@/ui/components/UserCard'
import { Avatar } from '@/ui/components/Avatar'
```

**Why?**: Barrel exports increase bundle size, slow down tree-shaking, and hide direct dependencies.

### ❌ Don't: Violate layer boundaries

```typescript
// ❌ Bad: UI calling outbound adapter directly
import { getUser } from '@/adapters/outbound/api/user'
const user = await getUser(id)

// ✅ Good: UI -> server-state -> inbound adapters -> use-cases
import { useWorkItems } from '@/ui/server-state/work-items/queries'
const { data: users } = useUsers()
```

### ❌ Don't: Treat Server Actions as use-cases

```typescript
// ❌ Bad: application logic mixed with framework adapter
'use server'

export async function createWorkItemAction(input: Input) {
  const { data } = await supabase.from('work_items').insert(input)
  revalidatePath('/admin/work-items')
  return data
}

// ✅ Good: thin inbound adapter calling a use-case
;('use server')

export async function createWorkItemAction(input: Input) {
  const result = await createWorkItem(deps, input)
  revalidatePath('/admin/work-items')
  return result
}
```

### ❌ Don't: Put business logic in components

```typescript
// ❌ Bad: Business logic in component
export function UserCard({ user }) {
  const fullName = user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name
  return <div>{fullName}</div>
}

// ✅ Good: Use domain utilities
import { getUserFullName } from '@/domain/user'
export function UserCard({ user }) {
  return <div>{getUserFullName(user)}</div>
}
```

### ❌ Don't: Hardcode strings

```typescript
// ❌ Bad: Hardcoded text
<Text>Welcome to Dashboard</Text>

// ✅ Good: Use translations
import messages from './messages.json'
<TranslationText {...messages.welcomeText} />
```

### ❌ Don't: Hardcode hex colors

```typescript
// ❌ Bad: Hardcoded hex
const color = '#ffffff'
style={{ color: '#C1C2C5' }}

// ✅ Good: Use palette colors (TypeScript)
import { darkColorScales } from '@/ui/themes/palette-dark'
const color = darkColorScales.gray[0]

// ✅ Good: Use CSS vars (CSS Modules)
.text { color: var(--mantine-color-gray-0); }

// ⚠️ Exception: rgba with transparency for glassmorphism
/* Colors: dark[6] = #25262B with 0.4 opacity */
background-color: rgba(37, 38, 43, 0.4);
```

### ❌ Don't: Create new objects in render

```typescript
// ❌ Bad: Creates new object on every render
<Component config={{ theme: 'dark' }} />

// ✅ Good: Stable reference
const config = useMemo(() => ({ theme: 'dark' }), [])
<Component config={config} />
```

## Quick Reference Links

- `@.claude/rules/architecture.md` - Clean Architecture layers (Domain, Adapters, Use-Cases)
- `@.claude/rules/components.md` - UI patterns, composeHooks, i18n
- `@.claude/rules/styling.md` - CSS Modules, Forms, Validation
- `@.claude/rules/data-state.md` - State Management, Server Components
- `@.claude/rules/quality.md` - Testing, Performance
- `@docs/ARCHITECTURE/QUICK_REFERENCE.md` - One-page cheatsheet
- `@docs/ARCHITECTURE/ARCHITECTURAL_RATIONALE.md` - Why the hybrid architecture exists
- `@docs/ARCHITECTURE/ARCHITECTURE.md` - Complete architecture guide
