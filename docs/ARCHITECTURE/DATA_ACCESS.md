# Data Access

## Outbound Adapters

All persistence and external I/O belongs in `src/adapters/outbound/`.

Typical structure:

```text
src/adapters/outbound/
├── supabase/
│   ├── work-items.operations.ts
│   ├── work-items.repository.ts
│   ├── labels.operations.ts
│   └── labels.repository.ts
├── api/
└── transport/
```

## Pattern

- `*.operations.ts` -> low-level queries, RPC calls, row mapping
- `*.repository.ts` -> factories that satisfy use-case ports

Example:

```ts
export function createSupabaseWorkItemRepository(
  supabase: SupabaseServerClient
): WorkItemRepository {
  return {
    list: (filters) => listWorkItemsOperation(supabase, filters),
    create: (input) => createWorkItemOperation(supabase, input),
  }
}
```

## Boundary Validation

Validate data at the domain boundary where it matters:

- parse DB rows or RPC payloads into domain types
- do not leak raw database shapes into UI

## Inbound Wiring

Server Actions compose dependencies:

```ts
export const listWorkItemsAction = withAdminAuth(async (ctx, filters) => {
  const workItems = createSupabaseWorkItemRepository(ctx.supabase)
  return listWorkItems({ workItems }, filters)
})
```
