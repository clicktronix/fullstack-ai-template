# First Feature

Use the demo `work-items` slice as the reference implementation.

For a small AI-oriented example on top of the same slice, also inspect:

- `src/domain/assistant-suggestion`
- `src/use-cases/assistant-suggestions`
- `src/adapters/outbound/api/assistant-suggestions.ts`
- `src/adapters/inbound/next/server-actions/assistant-suggestions.ts`
- `src/ui/server-state/assistant-suggestions`
- `src/app/(protected)/admin/work-items/_internal/ui/AssistantSuggestionsPanel`

## Recommended order

1. Domain
2. Use-cases
3. Outbound adapters
4. Inbound adapters
5. UI server-state
6. UI
7. Tests

## Example checklist

### 1. Domain

Create:

- `src/domain/<feature>/<entity>.ts`

Add:

- Valibot schema
- inferred types
- pure helpers and invariants

### 2. Use-cases

Create:

- `src/use-cases/<feature>/ports.ts`
- `src/use-cases/<feature>/<feature>.ts`
- `src/use-cases/<feature>/types.ts` only if needed

Keep this layer free from:

- React
- Next.js
- TanStack Query
- Server Actions

### 3. Outbound adapters

Create concrete implementations in:

- `src/adapters/outbound/supabase/`
- `src/adapters/outbound/api/`

### 4. Inbound adapters

Create:

- `src/adapters/inbound/next/server-actions/<feature>.ts`
- route handlers only when HTTP entrypoints are actually needed

### 5. Server-state

Expose data to UI through:

- `src/ui/server-state/<feature>/keys.ts`
- `queries.ts`
- `mutations.ts`
- `prefetch.ts` when SSR hydration is needed

### 6. UI

Consume only:

- `ui/server-state`
- feature-local `actions.ts` for one-off direct Server Actions

### 7. Testing

Add:

- unit tests for domain and use-cases
- server-state hook tests where useful
- one e2e smoke path for the new feature
