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

## DAL and Authorization

Every server-side path that reads user-scoped data must verify auth/authz in server-only code. `src/proxy.ts` can refresh sessions and redirect obvious anonymous requests, but it is not the authorization boundary.

Use these rules:

- modules that read cookies, headers, Supabase server clients, service-role keys, or secrets start with `import 'server-only'`
- layouts and Server Components use `verifySession()` from `src/infrastructure/auth/verify-session.ts`
- Server Actions and Route Handlers use `createAuthenticatedContext()` or `authActionClient` / `adminActionClient`
- DTOs returned to UI are parsed through domain schemas; raw DB rows stay inside outbound adapters

`verifySession()` is wrapped in React `cache()`, so repeated checks during the same server render are deduplicated.

## Inbound Wiring

Server Actions compose dependencies through safe-action clients:

```ts
const safeListWorkItemsAction = adminActionClient
  .inputSchema(WorkItemFiltersSchema)
  .action(async ({ ctx, parsedInput }) => {
    const workItems = createSupabaseWorkItemRepository(ctx.supabase)
    return listWorkItems({ workItems }, parsedInput)
  })

export async function listWorkItemsAction(filters: WorkItemFilters) {
  return unwrapSafeActionResult(await safeListWorkItemsAction(filters))
}
```

Use `createAuthenticatedContext()` or the `authActionClient` / `adminActionClient` middleware inside every server-side data path that depends on the current user. `src/proxy.ts` is only a request-time redirect/session-refresh layer, not the final authorization boundary.

For Supabase SSR auth, use `auth.getUser()` or DAL helpers built on it for server-side authorization. Do not trust `auth.getSession()` by itself on the server; it can read unverified cookie state and is only acceptable after a `getUser()` verification or in browser-only refresh flows.

Read env through `src/infrastructure/env/public.ts`, `client.ts`, `server.ts`, or `runtime.ts`. Runtime modules must not read `process.env` directly; this keeps service-role and backend-only values out of accidental public paths.

`src/proxy.ts` is the active Next.js Proxy file because this project uses `src/app`. It sets security headers for every matched request. CSP intentionally keeps `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'` while Cache Components/PPR are enabled: Next.js nonces require fully dynamic rendering, but PPR shells contain build-time scripts/styles that cannot receive a request-time nonce. If a route is moved out of PPR and made fully dynamic, nonce CSP can be enabled for that route and verified in HTML.

## Cache Invalidation

Server and client invalidation target different caches:

- Server Actions update the RSC/Data Cache with `updateTag()` for same-request read-your-writes and `revalidateTag(tag, profile)` for stale-while-revalidate refresh.
- Client TanStack mutations update the browser query cache with `queryClient.invalidateQueries()` or optimistic writes.

Do not add ad-hoc `revalidatePath()` beside tag invalidation in this template unless the route tree itself is the intentional invalidation unit. Prefer tags from `src/infrastructure/cache/tags.ts`.

After mutations, invalidate by tag:

```ts
updateTag(cacheTags.workItems.lists(ctx.userId))
revalidateTag(cacheTags.workItems.all, 'minutes')
```
